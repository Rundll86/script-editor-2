import argparse, pyzipper, json, os, hashlib, time

flower = "-\\|/"


def generate_sha256(data: bytes | str):
    sha256_hasher = hashlib.sha256()
    sha256_hasher.update(data if type(data) == bytes else data.encode("utf8"))
    return sha256_hasher.hexdigest()


def decompile(file_path, password: str = None):
    index = 0
    project_data = {
        "nodes": [],
        "characters": [],
        "feelings": [],
        "nouns": [],
        "assets": [],
        "assetsData": {},
    }
    byte_password = password.encode("utf8") if password else None
    with pyzipper.AESZipFile(
        file_path,
        "r",
    ) as zf:
        last_print = ""
        for file_name in zf.namelist():
            index += 1
            file_name: str
            with zf.open(file_name, "r", byte_password) as file:
                this_print = f"[{flower[index%len(flower)]}] - Decompiled: {file_name}"
                print(
                    this_print + " " * (len(last_print) - len(this_print)),
                    end="\r",
                    flush=True,
                )
                last_print = this_print
                content = file.read()
                try:
                    content = content.decode("utf8")
                except:
                    pass
                if file_name.endswith(".node"):
                    lines = content.split("\n")
                    node = {
                        "id": file_name.replace(".node", ""),
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
                elif file_name.endswith(".character"):
                    lines = content.split("\n")
                    character = {
                        "name": lines[0],
                        "feelings": {
                            int(k): int(v)
                            for k, v in (
                                pair.split(":") for pair in lines[1].split(",") if pair
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
                    asset_hash = generate_sha256(content)
                    project_data["assets"].append(
                        {
                            "type": asset_type,
                            "data": (content if asset_type == "script" else asset_hash),
                        }
                    )
                    if asset_type != "script":
                        project_data["assetsData"][asset_hash] = content
                time.sleep(namespace.time / 1000)
    print("")
    return project_data


class NamespaceMain:
    password: str
    file: str
    time: float


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-p", "--password")
    parser.add_argument("-f", "--file")
    parser.add_argument("-t", "--time", type=float, default=100)
    namespace: NamespaceMain = parser.parse_args()
    project = decompile(namespace.file, namespace.password)
    assetsDir = f"assets_{namespace.file}"
    os.makedirs(assetsDir, exist_ok=True)
    last_print = ""
    index = 0
    for assetName in project["assetsData"]:
        index += 1
        this_print = f"[{flower[index%len(flower)]}] - Extracted: Asset {index}"
        print(
            this_print + " " * (len(last_print) - len(this_print)),
            end="\r",
            flush=True,
        )
        last_print = this_print
        assetName: str
        assetData: bytes | str = project["assetsData"][assetName]
        open(f"{assetsDir}/{assetName}", "wb").write(
            assetData if type(assetData) == bytes else assetData.encode("utf8")
        )
        time.sleep(namespace.time / 1000)
    del project["assetsData"]
    outputFile = f"{os.path.basename(namespace.file)}.decompiled"
    json.dump(
        project,
        open(outputFile, "w", encoding="utf8"),
        ensure_ascii=False,
        indent=4,
    )
    print("")
    print(f"Output > {outputFile}")
    print(f"Assets > {assetsDir}")
