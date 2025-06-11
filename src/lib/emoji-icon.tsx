function emojiIcon(icon: string) {
    const EmojiComponent = () => (
        <span role='img' aria-label={icon}>
            {icon}
        </span>
    );
    EmojiComponent.displayName = `EmojiIcon(${icon})`;
    return EmojiComponent;
}

export default emojiIcon;
