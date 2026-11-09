import { PathCommand } from '../../types/vector';

/**
 * Tokenizes and parses an SVG path 'd' attribute string into a list of PathCommand objects.
 * Handles scientific notation, commas, spaces, consecutive minuses, and implicit repeat commands.
 */
export function parseSvgPath(d: string): PathCommand[] {
  if (!d || !d.trim()) return [];

  const commands: PathCommand[] = [];
  // Match a command letter followed by any arguments
  const commandRegex = /([a-df-z])([^a-df-z]*)/gi;
  let match: RegExpExecArray | null;

  while ((match = commandRegex.exec(d)) !== null) {
    const rawCmd = match[1];
    const argsStr = match[2];
    const relative = rawCmd === rawCmd.toLowerCase();
    const commandLetter = rawCmd.toUpperCase();

    // Extract numbers: handles negative numbers, floats, scientific notation
    const numberRegex = /[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g;
    const params: number[] = [];
    let numMatch: RegExpExecArray | null;

    while ((numMatch = numberRegex.exec(argsStr)) !== null) {
      params.push(parseFloat(numMatch[0]));
    }

    // SVG spec: if M has more than 2 params, subsequent pairs are treated as implicit L/l
    if (commandLetter === 'M' && params.length > 2) {
      commands.push({
        command: rawCmd,
        params: params.slice(0, 2),
        relative,
      });

      const lineCmd = relative ? 'l' : 'L';
      for (let i = 2; i < params.length; i += 2) {
        commands.push({
          command: lineCmd,
          params: params.slice(i, i + 2),
          relative,
        });
      }
      continue;
    }

    // Chunk parameters according to expected count for the command
    const expectedArgsMap: Record<string, number> = {
      M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0,
    };

    const count = expectedArgsMap[commandLetter] ?? 0;

    if (count === 0) {
      commands.push({ command: rawCmd, params: [], relative });
    } else if (params.length <= count) {
      commands.push({ command: rawCmd, params, relative });
    } else {
      // Multiple sets of arguments for this command
      for (let i = 0; i < params.length; i += count) {
        commands.push({
          command: rawCmd,
          params: params.slice(i, i + count),
          relative,
        });
      }
    }
  }

  return commands;
}

/**
 * Reconstructs standard SVG path 'd' string from PathCommands
 */
export function formatPathCommands(commands: PathCommand[]): string {
  return commands
    .map(cmd => {
      if (cmd.params.length === 0) return cmd.command;
      const formattedParams = cmd.params
        .map(n => (Number.isInteger(n) ? n.toString() : n.toFixed(2)))
        .join(' ');
      return `${cmd.command} ${formattedParams}`;
    })
    .join(' ');
}
