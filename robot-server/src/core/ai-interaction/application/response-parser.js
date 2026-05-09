class ResponseParser {
  parse(llmResponse) {
    if (typeof llmResponse === 'object' && llmResponse.text && llmResponse.actions) {
      return {
        text: llmResponse.text,
        actions: llmResponse.actions,
        quest: llmResponse.quest || null,
      };
    }

    if (typeof llmResponse === 'string') {
      const jsonMatch = llmResponse.match(/\{[\s\S]*"text"[\s\S]*"actions"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.text && parsed.actions) {
            return {
              text: parsed.text,
              actions: Array.isArray(parsed.actions) ? parsed.actions : [],
              quest: parsed.quest || null,
            };
          }
        } catch (error) {
          console.error('Error parsing JSON from LLM response:', error.message);
        }
      }

      const parts = llmResponse.split('---');
      if (parts.length >= 2) {
        const text = parts[0].trim();
        const actionsJson = parts.slice(1).join('---').trim();
        let actions = [];
        try {
          actions = JSON.parse(actionsJson);
          if (!Array.isArray(actions)) {
            actions = [];
          }
        } catch (error) {
          console.error('Error parsing actions JSON:', error.message);
        }
        return { text, actions, quest: null };
      }

      return {
        text: llmResponse.trim(),
        actions: [],
        quest: null,
      };
    }

    return {
      text: String(llmResponse),
      actions: [],
      quest: null,
    };
  }

  validateAction(action) {
    const validActions = [
      'forward', 'backward', 'left', 'right', 'stop',
      'walk', 'sit', 'shakehand', 'follow', 'step',
      'swing', 'updown', 'kick', 'auto_walk', 'balance',
      'calibration',
      'move', 'turn', 'stand'
    ];

    if (!action.action || !validActions.includes(action.action)) {
      console.warn(`Invalid action: ${action.action}`);
      return false;
    }

    if (!action.params || typeof action.params !== 'object') {
      console.warn(`Action ${action.action} missing params`);
      return false;
    }

    return true;
  }

  filterValidActions(actions) {
    return actions.filter(action => this.validateAction(action));
  }

  parseQuest(llmResponse) {
    if (typeof llmResponse === 'object' && llmResponse.description) {
      return {
        id: 'quest-' + Date.now(),
        description: llmResponse.description,
        cost: llmResponse.cost || 2,
        fromChain: llmResponse.fromChain || 'ETH',
        toChain: llmResponse.toChain || 'SOL',
      };
    }

    if (typeof llmResponse === 'string') {
      const jsonMatch = llmResponse.match(/\{[\s\S]*"description"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.description) {
            return {
              id: 'quest-' + Date.now(),
              description: parsed.description,
              cost: parsed.cost || 2,
              fromChain: parsed.fromChain || 'ETH',
              toChain: parsed.toChain || 'SOL',
            };
          }
        } catch (error) {
          console.error('Error parsing quest JSON:', error.message);
        }
      }
    }

    return null;
  }
}

module.exports = ResponseParser;
