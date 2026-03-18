/**
 * Simple logger utility for MCP server
 * Writes to stderr to avoid interfering with stdio JSON-RPC protocol
 */

const DEBUG = process.env.MCP_DEBUG === '1';

export const logger = {
  debug: (...args: any[]) => {
    if (DEBUG) {
      console.error('[DEBUG]', new Date().toISOString(), ...args);
    }
  },

  info: (...args: any[]) => {
    console.error('[INFO]', new Date().toISOString(), ...args);
  },

  warn: (...args: any[]) => {
    console.error('[WARN]', new Date().toISOString(), ...args);
  },

  error: (...args: any[]) => {
    console.error('[ERROR]', new Date().toISOString(), ...args);
  }
};
