import { createSignal, createEffect, onMount, Component } from "solid-js";
import { fetchEmojis } from "~/services/api";
import { cosineSimilarity } from "~/services/similarity";
import * as tf from '@tensorflow/tfjs';

const TextToEmojiTranslator: Component = () => {
    const [text, setText] = createSignal("");
    const [emojiMapping, setEmojiMapping] = createSignal<Record<string, string>>({});
    const [translatedText, setTranslatedText] = createSignal("");
    const [error, setError] = createSignal<string | null>(null);
    const [loading, setLoading] = createSignal(false);
    const [modelLoaded, setModelLoaded] = createSignal(false);
    let useModel: any;
    let emojiEntries: [string, string][] = [];
    let emojiEmbeddings: { description: string, embedding: any }[] = [];

    onMount(() => {
        const initialize = async () => {
            try {
                setLoading(true);
                const emojis = await fetchEmojis();
                setEmojiMapping(emojis);
                emojiEntries = Object.entries(emojis);
                console.log("Emoji Mapping:", emojis);

                const use = await import('@tensorflow-models/universal-sentence-encoder');
                useModel = await use.load();
                setModelLoaded(true);
                emojiEmbeddings = await computeEmojiEmbeddings();
                console.log("Model and embeddings loaded");
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        initialize();
    });

    const computeEmojiEmbeddings = async () => {
        return await Promise.all(
            emojiEntries.map(([description]) =>
                useModel.embed(description).then((embedding: any) => ({ description, embedding }))
            )
        );
    };

    const translateToEmoji = async () => {
        if (!modelLoaded()) return;
        if (error()) return;

        setLoading(true);
        try {
            const words = text().split(/\s+/);
            const wordEmbeddings = await Promise.all(words.map(word => useModel.embed(word)));
            console.log("Word Embeddings:", wordEmbeddings);

            const translation = words.map((word, i) => {
                const wordEmbedding = wordEmbeddings[i].arraySync()[0];
                let bestEmoji = word;
                let bestSimilarity = -Infinity;
                emojiEmbeddings.forEach(({ description, embedding }) => {
                    const similarity = cosineSimilarity(wordEmbedding, embedding.arraySync()[0]);
                    if (similarity > bestSimilarity) {
                        bestSimilarity = similarity;
                        bestEmoji = emojiMapping()[description];
                    }
                });
                console.log(`Word: ${word}, Best Emoji: ${bestEmoji}, Similarity: ${bestSimilarity}`);
                return bestEmoji;
            }).join(" ");

            setTranslatedText(translation);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ "margin": "2em" }}>
            <h1 style={{ "color": "#007f8b" }}>Text to Emoji Translator</h1>
            <div style={{ "display": "flex", "flex-direction": "column", "align-items": "center" }}>
                <label class="mdc-text-field mdc-text-field--filled mdc-text-field--textarea mdc-text-field--no-label" style={{ "width": "100%" }}>
                    <span class="mdc-text-field__ripple"></span>
                    <span class="mdc-text-field__resizer">
                        <textarea
                            id="textInput"
                            class="mdc-text-field__input"
                            rows="8"
                            cols="40"
                            aria-label="Text Input"
                            placeholder="Enter text here..."
                            onInput={(e) => setText(e.currentTarget.value)}
                            style={{ "width": "100%" }}
                        />
                    </span>
                    <span class="mdc-line-ripple"></span>
                </label>
                <button id="calculate" class="mdc-button mdc-button--raised" onClick={translateToEmoji} style={{ "margin-top": "20px" }} disabled={loading()}>
                    <span class="mdc-button__label">{loading() ? "Loading..." : "Translate"}</span>
                </button>
            </div>
            {error() && <p style={{ "color": 'red' }}>{error()}</p>}
            <p><b>Translated Text:</b></p>
            <p>{translatedText()}</p>
        </div>
    );
};

export default TextToEmojiTranslator;
