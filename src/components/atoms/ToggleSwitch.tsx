import { FormControlLabel, Switch } from '@mui/material';

interface Props {
    checked?: boolean;
    onChange: (v: boolean) => void;
    color?: string,
    label?: string;
}

export const ToggleSwitch =({ checked, onChange, label }: Props) => {
    return <FormControlLabel control={<Switch checked={checked} onChange={e => onChange(e.target.checked)} />} label={label} />;
}
