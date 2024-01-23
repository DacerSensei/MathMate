using System;
using System.Collections.Generic;
using System.Text;
using Xamarin.CommunityToolkit.ObjectModel;

namespace MathMate.Models
{
    public class Lesson : ObservableObject
    {
        public string Key { get; set; }
        public string title { get; set; }
        public string description { get; set; }
        public string created { get; set; }
        public string status { get; set; }
        public string statusColor { get; set; }
        public bool isCompleted { get; set; } = false;
    }
}
