import { SystemStateScreen } from "@/components/system-state-screen";

export default function NotFound() {
  return (
    <>
      <title>Page not found | PossoBuild</title>
      <SystemStateScreen
        kind="not-found"
        code="404"
        eyebrow="Page not found"
        title="This page isn’t part of your interview."
        description="The link may be incomplete or no longer available. Return to the interview entry page to continue safely."
        headerLabel="Navigation notice"
        primaryLabel="Return to interview"
        primaryHref="/"
      />
    </>
  );
}
