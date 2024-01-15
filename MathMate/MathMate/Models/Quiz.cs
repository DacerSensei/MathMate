using System;
using System.Collections.Generic;
using System.Text;

namespace MathMate.Models
{
    public class Quiz
    {
        public string Key { get; set; }
        public List<FlashCard> FlashCardsList { get; set; } = new List<FlashCard>();
        public string status { get; set; }
        public string statusColor { get; set; }
        public bool isCompleted { get; set; } = false;

    }
}
