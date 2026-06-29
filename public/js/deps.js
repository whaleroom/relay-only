export { h, render, Fragment } from 'preact'
export { useState, useEffect, useRef, useCallback, useMemo } from 'preact/hooks'
export { signal, computed, batch } from '@preact/signals'
import { h } from 'preact'
import htm from 'htm'
export const html = htm.bind(h)
