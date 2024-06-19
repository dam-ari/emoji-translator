import { Component } from "solid-js";

const LoadingAnimation: Component = () => {
    return (
        <div class="loading-animation">
            <div class="spinner">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
};

export default LoadingAnimation;
