class ResponseParser {
  parse(llmResponse) {
    if (typeof llmResponse === 'object' && llmResponse.text && llmResponse.actions) {
      return {
        text: llmResponse.text,
        actions: llmResponse.actions,
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
        return { text, actions };
      }

      return {
        text: llmResponse.trim(),
        actions: [],
      };
    }

    return {
      text: String(llmResponse),
      actions: [],
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
}

module.exports = ResponseParser;
