using System;
using System.Collections.Generic;
using System.Text;

namespace MathMate.Models
{
    public class FirebaseStorageMetadata
    {
        public string Name { get; set; }
        public string Bucket { get; set; }
        public string Generation { get; set; }
        public int Metageneration { get; set; }
        public string ContentType { get; set; }
        public DateTime TimeCreated { get; set; }
        public DateTime Updated { get; set; }
        public string StorageClass { get; set; }
        public long Size { get; set; }
        public string Md5Hash { get; set; }
        public string ContentEncoding { get; set; }
        public string ContentDisposition { get; set; }
        public string Crc32c { get; set; }
        public string Etag { get; set; }
        public string DownloadTokens { get; set; }
    }
}
