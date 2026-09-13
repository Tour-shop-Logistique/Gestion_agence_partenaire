import React from 'react';
import SearchableDropdown from './SearchableDropdown';
import { PHONE_COUNTRY_OPTIONS, sanitizePhoneDigits, isPhoneLengthValid } from '../../utils/phoneCountries';

const DIAL_CODE_OPTIONS = PHONE_COUNTRY_OPTIONS.map((c) => ({
    id: c.dialCode,
    label: `${c.name} (${c.dialCode})`,
}));

/**
 * Champ téléphone à deux parties : indicatif pays (obligatoire, choisi dans
 * une liste déroulante - voir PHONE_COUNTRY_OPTIONS) + numéro local (chiffres
 * uniquement, tout autre caractère saisi est filtré à la volée). Les deux
 * valeurs restent séparées côté formulaire, cohérent avec le stockage backend
 * (`indicatif_telephone` + `telephone`, voir AgenceUserController).
 *
 * L'indicatif sélectionné n'affiche que "+225" (pas le nom du pays) une fois
 * choisi, pour laisser toute la place au numéro local - le nom du pays reste
 * cherchable/visible dans la liste déroulante elle-même. La longueur du
 * numéro local (maxLength de l'input + message d'erreur) s'adapte au pays
 * sélectionné (voir PHONE_COUNTRY_OPTIONS.maxLength / isPhoneLengthValid).
 *
 * @param {string} dialCode - Indicatif sélectionné (ex: "+225"), '' si aucun.
 * @param {string} localNumber - Numéro local déjà nettoyé (chiffres seuls).
 * @param {(dialCode: string) => void} onDialCodeChange
 * @param {(localNumber: string) => void} onLocalNumberChange
 */
const PhoneInput = ({
    dialCode,
    localNumber,
    onDialCodeChange,
    onLocalNumberChange,
    required = true,
    inputClassName = '',
    disabled = false,
}) => {
    const selected = PHONE_COUNTRY_OPTIONS.find((c) => c.dialCode === dialCode);
    const lengthOk = isPhoneLengthValid(dialCode, localNumber);

    return (
        <div className="grid grid-cols-[6.5rem_1fr] gap-2">
            <SearchableDropdown
                options={DIAL_CODE_OPTIONS}
                onSelect={(option) => onDialCodeChange(option.id)}
                placeholder={selected ? selected.dialCode : 'Indicatif'}
                buttonClassName="h-full text-sm py-2.5"
                disabled={disabled}
            />
            <div>
                <input
                    type="tel"
                    inputMode="numeric"
                    required={required}
                    value={localNumber}
                    maxLength={selected?.maxLength}
                    onChange={(e) => onLocalNumberChange(sanitizePhoneDigits(e.target.value))}
                    onPaste={(e) => {
                        e.preventDefault();
                        const pasted = sanitizePhoneDigits(e.clipboardData.getData('text'));
                        onLocalNumberChange(sanitizePhoneDigits(`${localNumber}${pasted}`).slice(0, selected?.maxLength));
                    }}
                    disabled={disabled}
                    className={inputClassName}
                    placeholder={selected ? '0'.repeat(selected.maxLength) : 'XX XX XX XX'}
                />
                {!lengthOk && (
                    <p className="mt-1 ml-1 text-xs font-medium text-red-500">
                        Numéro invalide pour {selected.name} (attendu : {selected.maxLength} chiffres).
                    </p>
                )}
            </div>
        </div>
    );
};

export default PhoneInput;
