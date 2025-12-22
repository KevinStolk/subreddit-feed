import {ToggleSwitch} from "../atoms/ToggleSwitch";

interface Props {
    blurNsfw: boolean;
    onChange: (value: boolean) => void;
}

export const BlurToggle: React.FC<Props> = ({blurNsfw, onChange}) => {
    return (
        <ToggleSwitch checked={blurNsfw} onChange={onChange} label="Blur NSFW"/>
    );
};
