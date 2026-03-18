/**
 * Issue Formatter
 * Formats JIRA issues into beautiful, readable box format
 */

import { CleanedIssue } from '../types/jira.js';

/**
 * Format issue into a beautiful box layout
 */
export function formatIssueAsBox(issue: CleanedIssue): string {
  const width = 79;

  // Helper to create lines
  const topBorder = '╔' + '═'.repeat(width) + '╗';
  const bottomBorder = '╚' + '═'.repeat(width) + '╝';
  const divider = '╠' + '═'.repeat(width) + '╣';
  const emptyLine = '║' + ' '.repeat(width) + '║';

  const line = (text: string, leftPad: number = 2) => {
    const content = ' '.repeat(leftPad) + text;
    const padding = width - content.length;
    return '║' + content + ' '.repeat(Math.max(0, padding)) + '║';
  };

  const centerLine = (text: string) => {
    const padding = Math.floor((width - text.length) / 2);
    const content = ' '.repeat(padding) + text;
    const rightPad = width - content.length;
    return '║' + content + ' '.repeat(Math.max(0, rightPad)) + '║';
  };

  const twoColumns = (left: string, right: string, separator: string = '│') => {
    const midPoint = Math.floor(width / 2);
    const leftPadded = `  ${left}`.padEnd(midPoint - 2);
    const rightPadded = ` ${separator} ${right}`;
    const combined = leftPadded + rightPadded;
    const padding = width - combined.length;
    return '║' + combined + ' '.repeat(Math.max(0, padding)) + '║';
  };

  const separatorLine = () => {
    const content = '  ' + '─'.repeat(width - 4);
    return '║' + content + '  ║';
  };

  // Build the formatted output
  const lines: string[] = [];

  // Top border
  lines.push(topBorder);
  lines.push(emptyLine);

  // Title
  const titleEmoji = getTypeEmoji(issue.issueType);
  const title = `${titleEmoji}  ${issue.summary}`;
  lines.push(centerLine(title));
  lines.push(emptyLine);

  // Main divider
  lines.push(divider);
  lines.push(emptyLine);

  // Status and Priority
  lines.push(twoColumns(
    `🔄 Status:    ${issue.status.padEnd(18)}`,
    `⚡ Priority:  ${issue.priority}`
  ));
  lines.push(separatorLine());

  // Type and Project
  lines.push(twoColumns(
    `📋 Type:      ${issue.issueType.padEnd(18)}`,
    `🗂️  Project:   ${issue.project}`
  ));
  lines.push(separatorLine());

  // Assignee and Subtasks (placeholder for subtasks count)
  lines.push(twoColumns(
    `👤 Assignee:  ${issue.assignee.padEnd(18)}`,
    `📊 Subtasks:  0` // Could be extended to show actual subtask count
  ));
  lines.push(separatorLine());

  // Labels
  if (issue.labels && issue.labels.length > 0) {
    const labelsText = `🏷️  Labels:    ${issue.labels.join(', ')}`;
    lines.push(line(labelsText));
    lines.push(separatorLine());
  }

  // Dates
  const createdDate = formatDate(issue.created);
  const updatedDate = formatDate(issue.updated);
  lines.push(twoColumns(
    `📅 Created:   ${createdDate.padEnd(18)}`,
    `🔄 Updated:   ${updatedDate}`
  ));
  lines.push(emptyLine);

  // Description section
  if (issue.description && issue.description !== 'No description') {
    lines.push(divider);
    lines.push(emptyLine);
    lines.push(line('📖 DESCRIPTION', 2));
    lines.push(emptyLine);

    // Wrap description text
    const descLines = wrapText(issue.description, width - 6);
    descLines.forEach(descLine => {
      lines.push(line(descLine, 4));
    });
    lines.push(emptyLine);
  }

  // Comments section
  if (issue.comments && issue.comments.length > 0) {
    lines.push(divider);
    lines.push(emptyLine);
    lines.push(line(`💬 COMMENTS (${issue.comments.length})`, 2));
    lines.push(emptyLine);

    issue.comments.forEach((comment, index) => {
      const commentDate = formatDate(comment.created);
      lines.push(line(`▸ ${comment.author} • ${commentDate}`, 2));

      // Wrap comment text
      const commentLines = wrapText(comment.body, width - 8);
      commentLines.forEach(commentLine => {
        lines.push(line(commentLine, 4));
      });

      if (index < issue.comments.length - 1) {
        lines.push(emptyLine);
      }
    });
    lines.push(emptyLine);
  }

  // Bottom border
  lines.push(bottomBorder);

  return lines.join('\n');
}

/**
 * Format multiple issues as a list
 */
export function formatIssuesList(issues: CleanedIssue[]): string {
  if (issues.length === 0) {
    return '📭 No issues found.';
  }

  const lines: string[] = [];
  lines.push('');
  lines.push(`Found ${issues.length} issue${issues.length === 1 ? '' : 's'}:`);
  lines.push('');

  issues.forEach((issue, index) => {
    const emoji = getTypeEmoji(issue.issueType);
    const priority = getPriorityEmoji(issue.priority);
    const status = getStatusEmoji(issue.status);

    lines.push(
      `${index + 1}. ${status} ${issue.key}: ${issue.summary}`
    );
    lines.push(
      `   ${emoji} ${issue.issueType} | ${priority} ${issue.priority} | 👤 ${issue.assignee}`
    );

    if (issue.labels && issue.labels.length > 0) {
      lines.push(`   🏷️  ${issue.labels.join(', ')}`);
    }

    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Format issue as compact single line
 */
export function formatIssueCompact(issue: CleanedIssue): string {
  const emoji = getTypeEmoji(issue.issueType);
  const priority = getPriorityEmoji(issue.priority);
  const status = getStatusEmoji(issue.status);

  return `${status} ${issue.key}: ${issue.summary} (${emoji} ${issue.issueType}, ${priority} ${issue.priority}, 👤 ${issue.assignee})`;
}

/**
 * Get emoji for issue type
 */
function getTypeEmoji(type: string): string {
  const typeMap: Record<string, string> = {
    'Bug': '🐛',
    'Task': '🎫',
    'Story': '📖',
    'Epic': '🎯',
    'Sub-task': '📌',
    'Improvement': '✨',
    'New Feature': '🚀',
    'Technical task': '⚙️',
    'Spike': '🔬'
  };

  return typeMap[type] || '📋';
}

/**
 * Get emoji for priority
 */
function getPriorityEmoji(priority: string): string {
  const priorityMap: Record<string, string> = {
    'Highest': '🔴',
    'High': '🟠',
    'Medium': '🟡',
    'Low': '🟢',
    'Lowest': '⚪',
    'Critical': '🔴',
    'Major': '🟠',
    'Minor': '🟢',
    'Trivial': '⚪'
  };

  return priorityMap[priority] || '⚫';
}

/**
 * Get emoji for status
 */
function getStatusEmoji(status: string): string {
  const statusLower = status.toLowerCase();

  if (statusLower.includes('done') || statusLower.includes('closed') || statusLower.includes('resolved')) {
    return '✅';
  }
  if (statusLower.includes('progress') || statusLower.includes('review')) {
    return '🔄';
  }
  if (statusLower.includes('blocked') || statusLower.includes('stuck')) {
    return '🚫';
  }
  if (statusLower.includes('todo') || statusLower.includes('open') || statusLower.includes('backlog')) {
    return '📝';
  }
  if (statusLower.includes('testing') || statusLower.includes('qa')) {
    return '🧪';
  }

  return '📋';
}

/**
 * Format date to readable format
 */
function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return isoDate;
  }
}

/**
 * Wrap text to fit within specified width
 */
function wrapText(text: string, maxWidth: number): string[] {
  if (!text) return [];

  const lines: string[] = [];
  const paragraphs = text.split('\n');

  paragraphs.forEach(paragraph => {
    if (paragraph.trim() === '') {
      lines.push('');
      return;
    }

    const words = paragraph.split(' ');
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;

      if (testLine.length <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }
  });

  return lines;
}
