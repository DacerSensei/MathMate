using System;
using System.Collections.Generic;
using System.Text;

namespace MathMate.Models
{
    public class Quiz
    {
        public string Key { get; set; }
        public string Description { get; set; }
        public string Created { get; set; }
        public DateTime DueDate { get; set; }
        public string QuestionMode { get; set; }
        public string Title { get; set; }
        public Dictionary<string, FlashCard> Flashcards { get; set; }
        public string status { get; set; }
        public string statusColor { get; set; }
        public bool isCompleted { get; set; } = false;
        public int Attempts { get; set; }
        public int HighestScore { get; set; }
        public string AttemptString { get; set; }
        public string DueDateString
        {
            get => DueDate.ToString("MMM d, yyyy");
        }

    }
}
