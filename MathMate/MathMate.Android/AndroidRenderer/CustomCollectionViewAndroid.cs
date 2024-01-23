using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Service.Controls;
using Android.Views;
using Android.Widget;
using MathMate;
using MathMate.Droid.AndroidRenderer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Xamarin.Forms;
using Xamarin.Forms.Platform.Android;

[assembly: ExportRenderer(typeof(CustomCollectionView), typeof(CustomCollectionViewAndroid))]
namespace MathMate.Droid.AndroidRenderer
{
    public class CustomCollectionViewAndroid : CollectionViewRenderer
    {
        public CustomCollectionViewAndroid(Context context) : base(context)
        {

        }

        protected override void OnElementChanged(ElementChangedEventArgs<ItemsView> e)
        {
            base.OnElementChanged(e);
            if (e.NewElement == null)
            {
                VerticalScrollBarEnabled = false;
            }
        }
    }
}