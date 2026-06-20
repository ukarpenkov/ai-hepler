type AccessLevel = "system" | "memory";
type CallerContext = "agent" | "route" | "external";

const ACCESS_MATRIX: Record<AccessLevel, CallerContext[]> = {
  system: ["agent"],
  memory: ["agent", "route"],
};

export class ToolAccessGuard {
  private tools = new Map<string, AccessLevel>();

  registerTool(name: string, accessLevel: AccessLevel): void {
    this.tools.set(name, accessLevel);
  }

  checkAccess(toolName: string, callerContext: CallerContext): boolean {
    const level = this.tools.get(toolName);
    if (!level) return false;
    const allowedContexts = ACCESS_MATRIX[level];
    return allowedContexts.includes(callerContext);
  }

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }
}

export const defaultGuard = new ToolAccessGuard();

defaultGuard.registerTool("parseJobDescriptionTool", "system");
defaultGuard.registerTool("generateQuestionTool", "system");
defaultGuard.registerTool("evaluateAnswerTool", "system");
defaultGuard.registerTool("updateMemoryTool", "memory");
defaultGuard.registerTool("fetchWeakTopicsTool", "memory");
