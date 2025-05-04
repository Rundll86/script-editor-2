import pyzipper, io


class ScriptPlayer:
    def __init__(self):
        self.project_data = None

    @staticmethod
    def decompile(file_path: str | io.BytesIO | bytes, password: str = None):
        """
        Decompile the given file and extract assets.
        """
        project_data = {
            "nodes": [],
            "characters": [],
            "feelings": [],
            "nouns": [],
            "assets": [],
        }
        byte_password = password.encode("utf8") if password else None
        with pyzipper.AESZipFile(file_path, "r") as zf:
            for file_name in zf.namelist():
                file_name: str
                with zf.open(file_name, "r", byte_password) as file:
                    content = file.read()
                    try:
                        content = content.decode("utf8")
                    except:
                        pass
                    if file_name.endswith(".node"):
                        lines = content.split("\n")
                        node = {
                            "id": file_name.strip(".node").strip(".entry"),
                            "type": lines[0],
                            "talker": lines[1],
                            "message": lines[2],
                            "feeling": lines[3],
                            "assetId": lines[4],
                            "outPoints": [
                                {
                                    "label": pair.split(":")[0],
                                    "nextId": pair.split(":")[1],
                                }
                                for pair in lines[5].split(",")
                                if pair
                            ],
                        }
                        project_data["nodes"].append(node)
                        if file_name.endswith(".entry.node"):
                            project_data["entryNode"] = node["id"]
                    elif file_name.endswith(".character"):
                        lines = content.split("\n")
                        character = {
                            "name": lines[0],
                            "feelings": {
                                int(k): int(v)
                                for k, v in (
                                    pair.split(":")
                                    for pair in lines[1].split(",")
                                    if pair
                                )
                            },
                        }
                        project_data["characters"].append(character)
                    elif file_name.endswith(".feeling"):
                        project_data["feelings"].append(content.strip())
                    elif file_name.endswith(".noun"):
                        noun = {
                            "refer": file_name.replace(".noun", ""),
                            "calls": content.split("\n"),
                        }
                        project_data["nouns"].append(noun)
                    elif file_name.endswith((".image", ".video", ".script")):
                        asset_type = file_name.split(".")[-1]
                        project_data["assets"].append(
                            {
                                "type": asset_type,
                                "data": content,
                            }
                        )
        return project_data

    def open(self, file_path, password: str = None):
        self.project_data = ScriptPlayer.decompile(file_path, password)
        return self.project_data

    def find_node_by_id(self, node_id: str):
        if not self.project_data:
            raise ValueError("Project not loaded")
        node = next((n for n in self.project_data["nodes"] if n["id"] == node_id), None)
        if not node:
            raise ValueError(f"Node with ID {node_id} not found")
        return node

    def play(self, callback, node_id: str = None):
        if not self.project_data:
            raise ValueError("Project not loaded")
        current_node_id = node_id or self.project_data.get("entryNode")
        if not current_node_id:
            raise ValueError("No entry node found, please set a target")
        while current_node_id:
            node = self.find_node_by_id(current_node_id)
            next_index = callback(node)
            if next_index < 0 or next_index >= len(node["outPoints"]):
                break
            current_node_id = node["outPoints"][next_index]["nextId"]
