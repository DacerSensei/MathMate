using Firebase.Database.Query;
using MathMate.Config;
using MathMate.Models;
using MathMate.Services;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace MathMate.ViewModels
{
    public class ProfileViewModel : ObservableObject
    {
        public ProfileViewModel()
        {
            UploadCommand = new AsyncCommand(UploadExecute);
        }

        public ICommand UploadCommand { get; set; }

        private async Task UploadExecute()
        {
            var photo = await MediaPicker.PickPhotoAsync();
            if (photo == null)
            {
                return;
            }

            var uploadTask = Database.FirebaseStorage.Child(UserManager.User.Uid).Child("DisplayPicture").Child(photo.FileName).PutAsync(await photo.OpenReadAsync());
            uploadTask.Progress.ProgressChanged += (s, e) =>
            {
                UploadProgress = e.Percentage / 100f;
            };

            if(UserManager.User.DisplayPicture != null)
            {
                await Database.FirebaseStorage.Child(UserManager.User.Uid).Child("DisplayPicture").Child(UserManager.User.DisplayFileName).DeleteAsync();
            }
            UserManager.User.DisplayFileName = photo.FileName;
            UserManager.User.DisplayPicture = new Uri(await uploadTask);
            await Database.FirebaseClient.Child($"users/{UserManager.User.Username}").PatchAsync(new { DisplayPicture = UserManager.User.DisplayPicture, DisplayFileName = photo.FileName });
        }

        private float uploadProgress;
        public float UploadProgress
        {
            get => uploadProgress;
            set => SetProperty(ref uploadProgress, value);
        }

        private string role;
        public string Role
        {
            get => role;
            set => SetProperty(ref role, value);
        }

    }
}
