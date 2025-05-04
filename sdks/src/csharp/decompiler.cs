using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Text;
using System.Threading.Tasks;

public class Decompiler
{
    public class Node
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public string Talker { get; set; }
        public string Message { get; set; }
        public string Feeling { get; set; }
        public string AssetId { get; set; }
        public List<OutPoint> OutPoints { get; set; }
    }

    public class OutPoint
    {
        public string Label { get; set; }
        public string NextId { get; set; }
    }

    public class Character
    {
        public string Name { get; set; }
        public Dictionary<int, int> Feelings { get; set; }
    }

    public class Noun
    {
        public string Refer { get; set; }
        public List<string> Calls { get; set; }
    }

    public class Asset
    {
        public string Type { get; set; }
        public object Data { get; set; }
    }

    public class ProjectData
    {
        public List<Node> Nodes { get; set; } = new();
        public List<Character> Characters { get; set; } = new();
        public List<string> Feelings { get; set; } = new();
        public List<Noun> Nouns { get; set; } = new();
        public List<Asset> Assets { get; set; } = new();
        public string EntryNode { get; set; }
    }

    public static async Task<ProjectData> DecompileAsync(Stream fileStream)
    {
        var projectData = new ProjectData();

        using var archive = new ZipArchive(fileStream, ZipArchiveMode.Read);
        foreach (var entry in archive.Entries)
        {
            if (entry.Length == 0) continue;

            using var entryStream = entry.Open();
            using var reader = new StreamReader(entryStream, Encoding.UTF8);
            var content = await reader.ReadToEndAsync();

            if (entry.Name.EndsWith(".node"))
            {
                var lines = content.Split('\n');
                var node = new Node
                {
                    Id = entry.Name.Replace(".node", "").Replace(".entry", ""),
                    Type = lines[0],
                    Talker = lines[1],
                    Message = lines[2],
                    Feeling = lines[3],
                    AssetId = lines[4],
                    OutPoints = new List<OutPoint>()
                };

                foreach (var pair in lines[5].Split(',', StringSplitOptions.RemoveEmptyEntries))
                {
                    var parts = pair.Split(':');
                    node.OutPoints.Add(new OutPoint { Label = parts[0], NextId = parts[1] });
                }

                projectData.Nodes.Add(node);
                if (entry.Name.EndsWith(".entry.node"))
                {
                    projectData.EntryNode = node.Id;
                }
            }
            else if (entry.Name.EndsWith(".character"))
            {
                var lines = content.Split('\n');
                var character = new Character
                {
                    Name = lines[0],
                    Feelings = new Dictionary<int, int>()
                };

                foreach (var pair in lines[1].Split(',', StringSplitOptions.RemoveEmptyEntries))
                {
                    var parts = pair.Split(':');
                    character.Feelings[int.Parse(parts[0])] = int.Parse(parts[1]);
                }

                projectData.Characters.Add(character);
            }
            else if (entry.Name.EndsWith(".feeling"))
            {
                projectData.Feelings.Add(content.Trim());
            }
            else if (entry.Name.EndsWith(".noun"))
            {
                projectData.Nouns.Add(new Noun
                {
                    Refer = entry.Name.Replace(".noun", ""),
                    Calls = new List<string>(content.Split('\n', StringSplitOptions.RemoveEmptyEntries))
                });
            }
            else if (entry.Name.EndsWith(".image") || entry.Name.EndsWith(".video") || entry.Name.EndsWith(".script"))
            {
                projectData.Assets.Add(new Asset
                {
                    Type = Path.GetExtension(entry.Name).TrimStart('.'),
                    Data = content
                });
            }
        }

        return projectData;
    }
}
