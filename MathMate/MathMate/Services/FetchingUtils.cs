using MathMate.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace MathMate.Services
{
    public static class FetchingUtils
    {
        public static async Task<FirebaseStorageMetadata> FetchMetadataAsync(string url)
        {
            using (HttpClient client = new HttpClient())
            {
                HttpResponseMessage response = await client.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    string json = await response.Content.ReadAsStringAsync();
                    return JsonConvert.DeserializeObject<FirebaseStorageMetadata>(json);
                }
                else
                {
                    throw new HttpRequestException($"Failed to fetch data from URL: {url}. Status code: {response.StatusCode}");
                }
            }
        }
    }
}
