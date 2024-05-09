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
	public partial class TakeLesson : ContentPage
	{
		public TakeLesson (bool isCompleted)
		{
			InitializeComponent ();
			if (isCompleted)
			{
                MyTab.TabItems.RemoveAt(0);
                MyTab.TabItems.RemoveAt(2);
            }
        }
	}
}