using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Xamarin.Forms;

namespace MathMate.Behaviors
{
    public class FadeAnimationBehavior : Behavior<View>
    {
        protected override void OnAttachedTo(View bindable)
        {
            base.OnAttachedTo(bindable);
            bindable.PropertyChanged += Bindable_PropertyChanged;
        }

        protected override void OnDetachingFrom(View bindable)
        {
            base.OnDetachingFrom(bindable);
            bindable.PropertyChanged -= Bindable_PropertyChanged;
        }

        private async void Bindable_PropertyChanged(object sender, System.ComponentModel.PropertyChangedEventArgs e)
        {
            if (e.PropertyName == nameof(VisualElement.IsVisible))
            {
                var view = sender as View;

                if (view.IsVisible)
                {
                    view.TranslationX = -1000;
                    await Task.WhenAll(
                        view.FadeTo(1, 1000, Easing.CubicOut), // Fade out over 500 milliseconds
                        view.TranslateTo(0, 0, 1000, Easing.CubicOut) // Slide out to the left
                    );
                }
                else
                {
                    view.TranslationX = -1000;
                    await Task.WhenAll(
                        view.FadeTo(0, 1000, Easing.CubicOut),
                        view.TranslateTo(0, 0, 1000, Easing.CubicOut)
                    );
                }
            }
        }
    }
}
