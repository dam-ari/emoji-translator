// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import * as tf from '@tensorflow/tfjs';

mount(() => {
    tf.setBackend('webgl'); // Use 'webgl', 'cpu', or 'wasm' based on your choice

    return <StartClient />
}, document.getElementById("app")!);
