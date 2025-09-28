// Global type declarations for Svelte 5
import 'svelte';

declare module 'svelte' {
  // Type for $state
  function $state<T>(initialValue: T): T;
  
  // Type for $derived
  function $derived<T>(expression: T): T;
  
  // Type for $effect
  function $effect(callback: () => void | (() => void)): void;

  // Type for $props
  function $props<T>(): T;
  
  // Type for $bindable
  function $bindable<T>(): T;
  
  // Type for $inspect
  function $inspect<T>(value: T, options?: { label?: string }): T;
}
