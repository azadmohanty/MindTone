import traceback

from src.tabular.predict import main as tabular_prediction
from src.audio.predict import main as audio_prediction
from src.fusion.fusion import FusionEngine
from src.report.graphs import main as generate_graphs
from src.report.generate_report import main as generate_report
from src.history.save_history import HistoryManager
from src.history.clear_input import InputCleaner


def separator(title):

    print("\n")
    print("=" * 60)
    print(title.center(60))
    print("=" * 60)
    print()


def main():

    try:

        separator("MENTAL HEALTH ASSESSMENT STARTED")

        # ---------------------------------------------------
        # Step 1
        # ---------------------------------------------------

        separator("STEP 1 : TABULAR PREDICTION")

        tabular_prediction()

        # ---------------------------------------------------
        # Step 2
        # ---------------------------------------------------

        separator("STEP 2 : AUDIO PREDICTION")

        audio_prediction()

        # ---------------------------------------------------
        # Step 3
        # ---------------------------------------------------

        separator("STEP 3 : FUSION")

        fusion = FusionEngine()

        fusion.save()

        # ---------------------------------------------------
        # Step 4
        # ---------------------------------------------------

        separator("STEP 4 : GENERATING GRAPHS")

        generate_graphs()

        # ---------------------------------------------------
        # Step 5
        # ---------------------------------------------------

        separator("STEP 5 : GENERATING REPORT")

        report_name = generate_report()

        # ---------------------------------------------------
        # Step 6
        # ---------------------------------------------------

        separator("STEP 6 : SAVING HISTORY")

        HistoryManager().save(report_name)

        # ---------------------------------------------------
        # Step 7
        # ---------------------------------------------------

        separator("STEP 7 : CLEARING INPUT")

        InputCleaner().clear()

        # ---------------------------------------------------
        # Finished
        # ---------------------------------------------------

        separator("ASSESSMENT COMPLETED SUCCESSFULLY")

        print("✓ Tabular Prediction Completed")

        print("✓ Audio Prediction Completed")

        print("✓ Fusion Completed")

        print("✓ Graphs Generated")

        print("✓ PDF Report Generated")

        print("✓ Assessment Saved")

        print("✓ Input Folder Cleared")

        print("\nProject Finished Successfully.")

    except Exception:

        separator("ERROR")

        traceback.print_exc()

        print("\nAssessment Failed.")


if __name__ == "__main__":

    main()