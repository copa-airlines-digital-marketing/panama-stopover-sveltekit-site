import { mount } from 'svelte';
import Fixture from './fixture.svelte';
import '../../src/app.css';

mount(Fixture, { target: document.getElementById('app')! });
