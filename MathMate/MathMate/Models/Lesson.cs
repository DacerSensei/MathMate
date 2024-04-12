using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace MathMate.Models
{
    public class Lesson : ObservableObject
    {
        public string Key { get; set; }
        public string title { get; set; }
        public string description { get; set; }
        public string created { get; set; }
        public Uri link { get; set; }
        public string status { get; set; }
        public string statusColor { get; set; }
        public DateTime schedule { get; set; }
        public string videoPath { get; set; }
        public string videoName { get; set; }
        public Dictionary<string, Assessment> Assessment { get; set; }
        public bool isCompleted { get; set; } = false;
        public bool isThereLink { get; set; } = false;
        public bool isAvailable { get; set; } = false;

        public FormattedString DescriptionFormatted
        {
            get { return GetFormattedString(description); }
        }

        private FormattedString GetFormattedString(string description)
        {
            var formattedString = new FormattedString();

            string pattern = @"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+";

            Regex regex = new Regex(pattern);
            MatchCollection matches = regex.Matches(description);

            int currentPosition = 0;

            foreach (Match match in matches)
            {
                if (match.Index > currentPosition)
                {
                    formattedString.Spans.Add(new Span
                    {
                        Text = description.Substring(currentPosition, match.Index - currentPosition),
                        ForegroundColor = Color.Black
                    });
                }

                var linkSpan = new Span
                {
                    Text = match.Value,
                    ForegroundColor = Color.Blue,
                    TextDecorations = TextDecorations.Underline
                };

                linkSpan.GestureRecognizers.Add(new TapGestureRecognizer
                {
                    Command = new Command<string>(async (url) =>
                    {
                        await Launcher.OpenAsync(new Uri(url));
                    }),
                    CommandParameter = match.Value
                });

                formattedString.Spans.Add(linkSpan);

                currentPosition = match.Index + match.Length;
            }

            if (currentPosition < description.Length)
            {
                formattedString.Spans.Add(new Span
                {
                    Text = description.Substring(currentPosition),
                    ForegroundColor = Color.Black
                });
            }

            return formattedString;
        }
    }
}
