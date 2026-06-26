import {ToggleSwitch} from "../atoms/ToggleSwitch";

interface Props {
    enabled: boolean;
    onChange: (value: boolean) => void;
}

export const BookmarkRouletteToggle: React.FC<Props> = ({enabled, onChange}) => {
    return (
        <ToggleSwitch checked={enabled} onChange={onChange} label="Bookmark Roulette"/>
    );
};