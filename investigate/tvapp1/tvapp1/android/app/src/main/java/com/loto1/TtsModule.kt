package com.tvapp1

import android.speech.tts.TextToSpeech
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.Locale

class TtsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = TextToSpeech(reactContext, this)
    private var isReady = false

    override fun getName(): String = "TtsModule"

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(Locale("pt", "BR"))
            if (result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED) {
                isReady = true
            } else {
                // Fallback to default locale if pt-BR is missing
                tts?.setLanguage(Locale.getDefault())
                isReady = true
            }
        }
    }

    @ReactMethod
    fun speak(text: String) {
        if (isReady && tts != null && text.isNotBlank()) {
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "UtteranceId_" + System.currentTimeMillis())
        }
    }

    @ReactMethod
    fun stop() {
        try {
            tts?.stop()
        } catch (e: Exception) {
            // Ignore
        }
    }
}
