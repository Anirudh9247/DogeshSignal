import { runAuthTests } from "./auth.test";
import { runPaymentTests } from "./payment.test";
import { runAnalysisTests } from "./analysis.test";
import { runHistoryTests } from "./history.test";

async function main() {
  console.log("==========================================");
  console.log("🚀 Starting DogeshSignal Integration Tests ");
  console.log("==========================================\n");

  try {
    await runAuthTests();
    await runPaymentTests();
    await runAnalysisTests();
    await runHistoryTests();

    console.log("==========================================");
    console.log("🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!");
    console.log("==========================================");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ TESTS FAILED!");
    console.error(err);
    process.exit(1);
  }
}

main();
