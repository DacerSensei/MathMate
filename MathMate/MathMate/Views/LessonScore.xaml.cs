﻿using MathMate.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace MathMate.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class LessonScore : ContentPage
    {
        public LessonScore()
        {
            InitializeComponent();
            TapButton.CongratulationSound();
        }
    }
}