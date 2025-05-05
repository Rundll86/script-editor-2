import pyzipper, io
import base64
import re

allowed_pairs = ["$;", "[]", "{}"]
allowed_separators = ":.>%~#@→↣↝↠↣↦⇀⇏⇒⇥⇨⇢⇰⇸⇻⇾▸▹▶▷►▻-"
noun_spliter = re.compile(f"[{re.escape(allowed_separators)}]")
centerd = f"\\w+{noun_spliter.pattern}\\s*\\d+\\s*"
noun_matcher = re.compile(
    "|".join(
        f"(\{pair[0]}{centerd}\{pair[1]})"
        for pair in allowed_pairs
    )
)
unknown_noun_tip = "▸未知名词◂"

class ScriptPlayer:
    def __init__(self):
        self.project_data = None

    @staticmethod
    def decompile(file_path: str | io.BytesIO | bytes, password: str = None):
        """
        Decompile the given file and extract assets.
        """
        # 检查是否是 Base64 编码
        if isinstance(file_path, (str, bytes)):
            try:
                if isinstance(file_path, str):
                    file_path = file_path.encode("utf8")
                decoded_bytes = base64.b64decode(file_path, validate=True)
                file_path = io.BytesIO(decoded_bytes)
            except (base64.binascii.Error, ValueError):
                pass  # 不是 Base64 编码，继续使用原始输入

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

    def format(self, node: dict, key: str):
        if not self.project_data:
            raise ValueError("Project not loaded")
        if key == "message":
            return re.sub(
                noun_matcher,
                lambda match: self._replace_noun(match.group()),
                node["message"],
            )
        elif key == "talker":
            character = self.project_data["characters"][node["talker"]]
            return character["name"] if character else node["talker"]
        elif key == "feeling":
            return self.project_data["feelings"][node["feeling"]]
        elif key == "assetId":
            asset = self.project_data["assets"][node["assetId"]]
            return asset["data"] if asset and asset["type"] == "script" else node["assetId"]
        return node[key]

    def _replace_noun(self, match: str):
        data = re.split(noun_spliter, match[1:-1])
        refer, index = data[0].strip(), int(data[1]) - 1
        noun = next((n for n in self.project_data["nouns"] if n["refer"] == refer), None)
        if not noun or index < 0 or index >= len(noun["calls"]):
            return match
        return noun["calls"][index]
