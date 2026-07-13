# Fishki — Android

Projekt można otworzyć bezpośrednio w Android Studio.

## Uruchomienie

1. Otwórz folder `fishcards` w Android Studio.
2. Poczekaj na zakończenie synchronizacji Gradle.
3. Wybierz emulator lub podłączony telefon z Androidem 7.0 albo nowszym.
4. Kliknij **Run app**.

Interfejs aplikacji znajduje się w plikach `index.html`, `styles.css` i `app.js` w katalogu głównym. Gradle dołącza te pliki do APK jako zasoby. Dane użytkownika są przechowywane lokalnie przez WebView i pozostają dostępne po ponownym uruchomieniu aplikacji.

## Wersja produkcyjna

W Android Studio wybierz **Build > Generate Signed App Bundle or APK**. Do publikacji w Google Play wybierz Android App Bundle (`.aab`) i podpisz go własnym kluczem wydawcy.
