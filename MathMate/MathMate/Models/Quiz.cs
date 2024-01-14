using System;
using System.Collections.Generic;
using System.Text;

namespace MathMate.Models
{
    public class Quiz
    {
        public string Key { get; set; }
        public string title { get; set; }
        public List<FlashCard> FlashCardsList { get; set; } = new List<FlashCard>();
    }
}
