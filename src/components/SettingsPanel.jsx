import { useState } from 'react';
import { X, Trash2, RotateCcw, Weight, Sun, Moon } from 'lucide-react';

export default function SettingsPanel({ onClose, onClearAll, onResetSeries, weightUnit, onChangeUnit, theme, onChangeTheme }) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle"><div className="modal-handle-bar" /></div>
        <div className="modal-header">
          <div className="modal-title">Ajustes</div>
          <button className="modal-close" onClick={onClose}><X size={22} /></button>
        </div>

        <div className="settings-list">
          {/* Theme */}
          <div className="settings-item">
            <div className="settings-item-left">
              {theme === 'dark' ? <Moon size={20} color="var(--accent-indigo)" /> : <Sun size={20} color="var(--accent-amber)" />}
              <span>Tema</span>
            </div>
            <div className="settings-toggle-group">
              <button
                className={`settings-unit-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => onChangeTheme('dark')}
              >Oscuro</button>
              <button
                className={`settings-unit-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => onChangeTheme('light')}
              >Claro</button>
            </div>
          </div>

          {/* Weight unit */}
          <div className="settings-item">
            <div className="settings-item-left">
              <Weight size={20} color="var(--accent-blue)" />
              <span>Unidad de peso</span>
            </div>
            <div className="settings-toggle-group">
              <button
                className={`settings-unit-btn ${weightUnit === 'kg' ? 'active' : ''}`}
                onClick={() => onChangeUnit('kg')}
              >kg</button>
              <button
                className={`settings-unit-btn ${weightUnit === 'lbs' ? 'active' : ''}`}
                onClick={() => onChangeUnit('lbs')}
              >lbs</button>
            </div>
          </div>

          {/* Reset series */}
          <div className="settings-item">
            <div className="settings-item-left">
              <RotateCcw size={20} color="var(--accent-green)" />
              <span>Desmarcar todas las series</span>
            </div>
            {confirmReset ? (
              <div className="settings-confirm-group">
                <button className="settings-confirm-btn yes" onClick={() => { onResetSeries(); setConfirmReset(false); }}>Sí</button>
                <button className="settings-confirm-btn no" onClick={() => setConfirmReset(false)}>No</button>
              </div>
            ) : (
              <button className="settings-action-btn" onClick={() => setConfirmReset(true)}>Reiniciar</button>
            )}
          </div>

          {/* Clear all */}
          <div className="settings-item danger">
            <div className="settings-item-left">
              <Trash2 size={20} color="var(--accent-coral)" />
              <span>Borrar todos los datos</span>
            </div>
            {confirmClear ? (
              <div className="settings-confirm-group">
                <button className="settings-confirm-btn yes danger" onClick={() => { onClearAll(); setConfirmClear(false); }}>Sí</button>
                <button className="settings-confirm-btn no" onClick={() => setConfirmClear(false)}>No</button>
              </div>
            ) : (
              <button className="settings-action-btn danger" onClick={() => setConfirmClear(true)}>Borrar</button>
            )}
          </div>
        </div>

        <div className="settings-footer">
          <span className="settings-version">GymFlow v1.0</span>
        </div>
      </div>
    </div>
  );
}
