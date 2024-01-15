using System;
using System.Collections.Generic;
using System.Text;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Essentials;

namespace MathMate.Models
{
    public class FlashCard : ObservableObject
    {
        public string Key { get; set; }

        private string prob;
        public string problem
        {
            get => prob;
            set
            {
                SetProperty(ref prob, value);
            }
        }

        private string sol;
        public string solution
        {
            get => sol;
            set
            {
                SetProperty(ref sol, value);
            }
        }

        private bool isCurrentQuestion = false;
        public bool IsCurrentQuestion
        {
            get => isCurrentQuestion;
            set
            {
                SetProperty(ref isCurrentQuestion, value);
            }
        }
    }
}
