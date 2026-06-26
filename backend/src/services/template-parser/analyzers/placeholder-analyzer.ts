import { Placeholder } from '../models/template.model.js';
import { Section } from '../models/section.model.js';

export class PlaceholderAnalyzer {
  analyze(sections: Section[], rawContent: string): Placeholder[] {
    const placeholders: Placeholder[] = [];
    let id = 0;

    // Common placeholder patterns
    const patterns = [
      // Bracketed placeholders: [Name], [Title], etc.
      { regex: /\[([^\]]+)\]/g, type: 'field' as const },
      // Curly braces: {Name}, {Title}, etc.
      { regex: /\{([^}]+)\}/g, type: 'field' as const },
      // Underscore placeholders: _____
      { regex: /_{3,}/g, type: 'text' as const },
      // Dollar sign placeholders: $Name$
      { regex: /\$([^$]+)\$/g, type: 'field' as const },
      // Double angle: <<Name>>
      { regex: /<<([^>]+)>>/g, type: 'field' as const }
    ];

    // Search in each section
    for (const section of sections) {
      const content = section.content;
      
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.regex.exec(content)) !== null) {
          const label = match[1] || 'placeholder';
          const placeholder: Placeholder = {
            id: `placeholder-${id++}`,
            type: pattern.type,
            label: label.trim(),
            location: {
              sectionId: section.id,
              position: match.index
            },
            metadata: {
              fieldType: this.inferFieldType(label.trim()),
              required: true
            }
          };
          placeholders.push(placeholder);
        }
      }
    }

    // Also search in raw content for placeholders
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.regex.exec(rawContent)) !== null) {
        const label = match[1] || 'placeholder';
        // Check if already found in sections
        const exists = placeholders.some(p => p.label === label.trim());
        if (!exists) {
          const placeholder: Placeholder = {
            id: `placeholder-${id++}`,
            type: pattern.type,
            label: label.trim(),
            location: {
              sectionId: 'unknown',
              position: match.index
            },
            metadata: {
              fieldType: this.inferFieldType(label.trim()),
              required: false
            }
          };
          placeholders.push(placeholder);
        }
      }
    }

    // Remove duplicates
    const uniquePlaceholders = this.removeDuplicates(placeholders);
    
    return uniquePlaceholders;
  }

  private inferFieldType(label: string): 'name' | 'date' | 'title' | 'institution' | 'custom' {
    const lowerLabel = label.toLowerCase();
    
    const typeMap: Record<string, 'name' | 'date' | 'title' | 'institution' | 'custom'> = {
      'name': 'name',
      'student': 'name',
      'author': 'name',
      'guide': 'name',
      'supervisor': 'name',
      'teacher': 'name',
      'instructor': 'name',
      'date': 'date',
      'year': 'date',
      'title': 'title',
      'project': 'title',
      'report': 'title',
      'topic': 'title',
      'subject': 'title',
      'university': 'institution',
      'college': 'institution',
      'institute': 'institution',
      'school': 'institution',
      'organization': 'institution',
      'company': 'institution',
      'department': 'institution'
    };

    for (const [key, value] of Object.entries(typeMap)) {
      if (lowerLabel.includes(key)) {
        return value;
      }
    }

    return 'custom';
  }

  private removeDuplicates(placeholders: Placeholder[]): Placeholder[] {
    const seen = new Set<string>();
    const unique: Placeholder[] = [];

    for (const placeholder of placeholders) {
      const key = `${placeholder.label}-${placeholder.type}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(placeholder);
      }
    }

    return unique;
  }
}

export default new PlaceholderAnalyzer();