import librosa
import numpy as np
import pandas as pd
import parselmouth


class AudioFeatureExtractor:

    def __init__(self, audio_path):

        self.audio_path = str(audio_path)
        self.is_valid = True

        try:
            self.signal, self.sr = librosa.load(
                self.audio_path,
                sr=None
            )

            self.sound = parselmouth.Sound(
                self.audio_path
            )
        except Exception:
            self.is_valid = False
            self.signal = np.array([])
            self.sr = 22050
            self.sound = None

    def pitch(self):

        if not self.is_valid or self.sound is None:
            return 150.0

        try:
            pitch = self.sound.to_pitch()
            values = pitch.selected_array["frequency"]
            values = values[values > 0]
            if len(values) == 0:
                return 150.0
            val = np.mean(values)
            return 150.0 if np.isnan(val) else float(val)
        except Exception:
            return 150.0

    def pitch_variability(self):

        if not self.is_valid or self.sound is None:
            return 30.0

        try:
            pitch = self.sound.to_pitch()
            values = pitch.selected_array["frequency"]
            values = values[values > 0]
            if len(values) == 0:
                return 30.0
            val = np.std(values)
            return 30.0 if np.isnan(val) else float(val)
        except Exception:
            return 30.0

    def speech_rate(self):

        if not self.is_valid or len(self.signal) == 0:
            return 2.5

        try:
            zcr = librosa.feature.zero_crossing_rate(
                self.signal
            )[0]
            val = np.mean(zcr) * self.sr
            return 2.5 if np.isnan(val) else float(val)
        except Exception:
            return 2.5

    def pause_duration(self):

        if not self.is_valid or len(self.signal) == 0:
            return 0.5

        try:
            intervals = librosa.effects.split(
                self.signal,
                top_db=30
            )

            speech = np.sum(
                [
                    end-start
                    for start, end in intervals
                ]
            ) / self.sr

            total = librosa.get_duration(
                y=self.signal,
                sr=self.sr
            )

            val = total - speech
            return 0.5 if np.isnan(val) else float(val)
        except Exception:
            return 0.5

    def voice_energy(self):

        if not self.is_valid or len(self.signal) == 0:
            return 0.05

        try:
            rms = librosa.feature.rms(
                y=self.signal
            )[0]
            val = np.mean(rms)
            return 0.05 if np.isnan(val) else float(val)
        except Exception:
            return 0.05

    def jitter(self):

        if not self.is_valid or self.sound is None:
            return 0.015

        try:
            point = parselmouth.praat.call(
                self.sound,
                "To PointProcess (periodic, cc)",
                75,
                500
            )

            val = parselmouth.praat.call(
                point,
                "Get jitter (local)",
                0,
                0,
                0.0001,
                0.02,
                1.3
            )
            return 0.015 if np.isnan(val) else float(val)
        except Exception:
            return 0.015

    def shimmer(self):

        if not self.is_valid or self.sound is None:
            return 0.04

        try:
            point = parselmouth.praat.call(
                self.sound,
                "To PointProcess (periodic, cc)",
                75,
                500
            )

            val = parselmouth.praat.call(
                [
                    self.sound,
                    point
                ],
                "Get shimmer (local)",
                0,
                0,
                0.0001,
                0.02,
                1.3,
                1.6
            )
            return 0.04 if np.isnan(val) else float(val)
        except Exception:
            return 0.04

    def hnr(self):

        if not self.is_valid or self.sound is None:
            return 15.0

        try:
            harmonicity = parselmouth.praat.call(
                self.sound,
                "To Harmonicity (cc)",
                0.01,
                75,
                0.1,
                1.0
            )

            val = parselmouth.praat.call(
                harmonicity,
                "Get mean",
                0,
                0
            )
            return 15.0 if np.isnan(val) else float(val)
        except Exception:
            return 15.0

    def extract(self):

        data = {

            "Pitch":[self.pitch()],

            "Pitch Variability":[
                self.pitch_variability()
            ],

            "Speech Rate":[
                self.speech_rate()
            ],

            "Pause Duration":[
                self.pause_duration()
            ],

            "Voice Energy":[
                self.voice_energy()
            ],

            "Jitter":[
                self.jitter()
            ],

            "Shimmer":[
                self.shimmer()
            ],

            "HNR":[
                self.hnr()
            ]

        }

        return pd.DataFrame(data)


if __name__ == "__main__":

    extractor = AudioFeatureExtractor(
        "input/audio.wav"
    )

    df = extractor.extract()

    print(df)