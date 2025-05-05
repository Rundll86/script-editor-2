using System.Text;
using System.IO;
using System;
using Ionic.Zip;
namespace ScriptEditor.Decompiler
{
    public class ScriptPlayer
    {
        public class Node
        {
            public string? Id { get; set; }
            public string? Type { get; set; }
            public string? Talker { get; set; }
            public string? Message { get; set; }
            public string? Feeling { get; set; }
            public string? AssetId { get; set; }
            public List<OutPoint>? OutPoints { get; set; }
        }

        public class OutPoint
        {
            public string? Label { get; set; }
            public string? NextId { get; set; }
        }

        public class Character
        {
            public string? Name { get; set; }
            public Dictionary<int, int>? Feelings { get; set; }
        }

        public class Noun
        {
            public string? Refer { get; set; }
            public List<string>? Calls { get; set; }
        }

        public class Asset
        {
            public string? Type { get; set; }
            public object? Data { get; set; }
        }

        public class ProjectData
        {
            public List<Node> Nodes { get; set; } = [];
            public List<Character> Characters { get; set; } = [];
            public List<string> Feelings { get; set; } = [];
            public List<Noun> Nouns { get; set; } = [];
            public List<Asset> Assets { get; set; } = [];
            public string? EntryNode { get; set; }
        }

        private ProjectData? project;

        public async Task<ProjectData> Open(Stream fileStream, string? password)
        {
            project = await Decompile(fileStream, password);
            return project;
        }

        public Node FindNodeById(string nodeId)
        {
            if (project == null) throw new InvalidOperationException("Project not loaded");
            var result = project.Nodes.FirstOrDefault(node => node.Id == nodeId);
            if (result == null) throw new KeyNotFoundException("Node not found");
            return result;
        }

        public async Task Play(Func<Node, Task<int>> callback, string? nodeId = null)
        {
            if (project == null) throw new InvalidOperationException("Project not loaded");
            var nodeID = nodeId ?? project.EntryNode;
            if (nodeID == null) throw new InvalidOperationException("No entry node found, please set a target");
            var node = FindNodeById(nodeID);
            var state = await callback(node);
            if (state >= 0) await Play(callback, node.OutPoints?[state].NextId);
        }

        public static async Task<ProjectData> Decompile(Stream fileStream, string? password = null)
        {
            var projectData = new ProjectData();

            // 检查是否是Base64编码
            if (fileStream is MemoryStream memoryStream)
            {
                try
                {
                    var base64String = Encoding.UTF8.GetString(memoryStream.ToArray());
                    var decodedBytes = Convert.FromBase64String(base64String);
                    fileStream = new MemoryStream(decodedBytes);
                }
                catch (FormatException)
                {
                    memoryStream.Position = 0; // 不是Base64编码，继续使用原始流
                }
            }

            using var archive = ZipFile.Read(fileStream);
            archive.Password = password;
            foreach (var entry in archive.Entries)
            {
                using var entryStream = entry.OpenReader();
                using var reader = new StreamReader(entryStream, Encoding.UTF8);
                var content = await reader.ReadToEndAsync();
                if (entry.FileName.EndsWith(".node"))
                {
                    var lines = content.Split('\n');
                    var node = new Node
                    {
                        Id = entry.FileName.Replace(".node", "").Replace(".entry", ""),
                        Type = lines[0],
                        Talker = lines[1],
                        Message = lines[2],
                        Feeling = lines[3],
                        AssetId = lines[4],
                        OutPoints = []
                    };

                    foreach (var pair in lines[5].Split(',', StringSplitOptions.RemoveEmptyEntries))
                    {
                        var parts = pair.Split(':');
                        node.OutPoints.Add(new OutPoint { Label = parts[0], NextId = parts[1] });
                    }

                    projectData.Nodes.Add(node);
                    if (entry.FileName.EndsWith(".entry.node"))
                    {
                        projectData.EntryNode = node.Id;
                    }
                }
                else if (entry.FileName.EndsWith(".character"))
                {
                    var lines = content.Split('\n');
                    var character = new Character
                    {
                        Name = lines[0],
                        Feelings = []
                    };

                    foreach (var pair in lines[1].Split(',', StringSplitOptions.RemoveEmptyEntries))
                    {
                        var parts = pair.Split(':');
                        character.Feelings[int.Parse(parts[0])] = int.Parse(parts[1]);
                    }

                    projectData.Characters.Add(character);
                }
                else if (entry.FileName.EndsWith(".feeling"))
                {
                    projectData.Feelings.Add(content.Trim());
                }
                else if (entry.FileName.EndsWith(".noun"))
                {
                    projectData.Nouns.Add(new Noun
                    {
                        Refer = entry.FileName.Replace(".noun", ""),
                        Calls = content.Split('\n', StringSplitOptions.RemoveEmptyEntries).ToList()
                    });
                }
                else if (entry.FileName.EndsWith(".image") || entry.FileName.EndsWith(".video") || entry.FileName.EndsWith(".script"))
                {
                    projectData.Assets.Add(new Asset
                    {
                        Type = Path.GetExtension(entry.FileName).TrimStart('.'),
                        Data = content
                    });
                }
            }

            return projectData;
        }
    }
}