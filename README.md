# Study Arena Android app

1. Create a new GitHub repo and upload everything in this folder (keep the `.github` folder).
2. Open the repo's **Actions** tab, pick **Build Android APK**, click **Run workflow**.
3. When it finishes (about 5 minutes), open the run and download **study-arena-apk** from Artifacts.
4. Unzip it and install `app-debug.apk` on your phone (allow "install unknown apps").

To update the app: change `www/index.html`, commit, and the workflow builds a fresh APK.
