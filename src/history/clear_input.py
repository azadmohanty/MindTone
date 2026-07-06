from src.config.paths import (
    QUESTIONNAIRE_INPUT,
    AUDIO_INPUT
)


class InputCleaner:

    def clear(self):

        # Delete Questionnaire

        if QUESTIONNAIRE_INPUT.exists():

            QUESTIONNAIRE_INPUT.unlink()

            print("✓ questionnaire.csv deleted")

        else:

            print("questionnaire.csv not found")

        # Delete Audio

        if AUDIO_INPUT.exists():

            AUDIO_INPUT.unlink()

            print("✓ audio.wav deleted")

        else:

            print("audio.wav not found")

        print("\nInput folder cleared successfully.")


if __name__ == "__main__":

    InputCleaner().clear()