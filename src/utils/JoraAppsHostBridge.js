// ============================================================
// JoraAppsHostBridge
// Runs in the OUTER page (the Nexa user-app, NOT inside the
// mini-app iframe). Listens for postMessage requests sent by
// the @nexa/sdk running inside the mini-app and resolves them
// by showing host-styled UI (never the browser's native
// alert/confirm/prompt), then replies with a matching message.
//
// Protocol (all messages are JSON, sent via window.postMessage):
//   Mini-app -> Host:  { source: 'nexa-sdk', id, type, payload }
//   Host -> Mini-app:  { source: 'nexa-host', id, type: 'reply', result }
//
// Request types handled here:
//   'alert'         { message }                  -> { ok: true }
//   'confirm'       { message, okLabel, cancelLabel } -> { ok: boolean }
//   'select'        { message, options: [{label,value}] } -> { ok, value }
//   'prompt'        { message, placeholder, defaultValue } -> { ok, value }
//   'requestUserData' { scopes: [] }              -> handled by caller (async DB call)
//   'requestConnect'  { scopes: [] }               -> handled by caller
//   'close'          {}                            -> handled by caller (navigate back)
//   'ready'          {}                            -> handshake ack
//
// Anything NOT in this list is ignored — the iframe cannot ask
// the host to do arbitrary things.
// ============================================================

const ALLOWED_TYPES = new Set([
  'ready', 'alert', 'confirm', 'select', 'prompt',
  'requestUserData', 'requestConnect', 'requestDisconnect',
  'close', 'hapticFeedback', 'setTitle', 'openExternalConfirm',
]);

export class JoraAppsHostBridge {
  /**
   * @param {Object} opts
   * @param {Window} opts.iframeWindow - contentWindow of the sandboxed iframe
   * @param {string} opts.targetOrigin - exact origin of the mini-app (never '*')
   * @param {(req: {type:string, payload:any}) => Promise<any>} opts.onRequest
   *        Handler for app-level requests (requestUserData, requestConnect,
   *        close, etc). Must return the `result` payload to send back.
   * @param {(ui: {kind:string, payload:any, resolve:Function}) => void} opts.onUI
   *        Handler for UI requests (alert/confirm/select/prompt). Caller is
   *        responsible for rendering host UI and calling resolve(result).
   */
  constructor({ iframeWindow, targetOrigin, onRequest, onUI }) {
    this.iframeWindow = iframeWindow;
    this.targetOrigin = targetOrigin;
    this.onRequest = onRequest;
    this.onUI = onUI;
    this._listener = this._handleMessage.bind(this);
  }

  attach() {
    window.addEventListener('message', this._listener);
  }

  detach() {
    window.removeEventListener('message', this._listener);
  }

  _reply(id, type, result) {
    if (!this.iframeWindow) return;
    try {
      this.iframeWindow.postMessage(
        { source: 'joraapps-host', id, type: 'reply', result },
        this.targetOrigin
      );
    } catch {
      /* iframe navigated away mid-flight — ignore */
    }
  }

  async _handleMessage(event) {
    // Strict origin check — never trust '*' senders.
    if (event.origin !== this.targetOrigin) return;
    const data = event.data;
    if (!data || data.source !== 'joraapps-sdk' || !data.id || !data.type) return;
    if (!ALLOWED_TYPES.has(data.type)) return;

    const { id, type, payload } = data;

    try {
      if (type === 'ready') {
        this._reply(id, type, { ok: true, host: 'joraapps-host' });
        return;
      }

      if (['alert', 'confirm', 'select', 'prompt'].includes(type)) {
        this.onUI?.({
          kind: type,
          payload,
          resolve: (result) => this._reply(id, type, result),
        });
        return;
      }

      // App-level async requests (user data, connect, navigation, etc.)
      const result = await this.onRequest?.({ type, payload });
      this._reply(id, type, result ?? { ok: true });
    } catch (err) {
      this._reply(id, type, { ok: false, error: err?.message || 'Host error' });
    }
  }
}
