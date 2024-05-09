using System;
using System.Collections.Generic;
using System.Text;

namespace MathMate.Models
{
    public class Performance
    {
        public string Key { get; set; }
        public string Score { get; set; }
        public string Date { get; set; }
        public string Total { get; set; }
        public string Title { get; set; }
        public string TitleColor { get; set; }
        public string Description { get; set; }
        public int? Attempts { get; set; }

    }
}
