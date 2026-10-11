import type { ChainId } from '../lib/fees';

/**
 * Chain logos, the "background" network icons (mark on its brand-colour tile) from web3icons
 * (https://github.com/0xa3k5/web3icons, @web3icons/core 4.0.58), inlined so they
 * ship with the page and work offline.
 *
 * MIT License, Copyright (c) 2024 0xa3k5. Permission is hereby granted, free of
 * charge, to any person obtaining a copy of this software and associated
 * documentation files, to deal in the Software without restriction, subject to
 * including this notice. The software is provided "as is", without warranty of
 * any kind.
 */
const PATHS: Record<ChainId, string> = {
  solana: '<g clip-path="url(#solana__a)"><path fill="url(#solana__b)" d="M24 0H0v24h24z"/><path fill="#fff" d="M17.7 8.358a.55.55 0 0 1-.365.145H4.515c-.455 0-.684-.52-.37-.825l2.106-2.03a.54.54 0 0 1 .364-.15h12.87c.46 0 .685.524.365.83zm0 10.005c-.1.09-.23.14-.365.14H4.515c-.455 0-.684-.516-.37-.82l2.106-2.036a.53.53 0 0 1 .364-.145h12.87c.46 0 .685.52.365.825zm0-7.72a.55.55 0 0 0-.365-.14H4.515c-.455 0-.684.515-.37.82l2.106 2.035c.1.091.23.143.364.144h12.87c.46 0 .685-.52.365-.824z"/></g><defs><linearGradient id="solana__b" x1="4.001" x2="20.408" y1="50.258" y2="50.108" gradientUnits="userSpaceOnUse"><stop stop-color="#599DB0"/><stop offset="1" stop-color="#47F8C3"/></linearGradient><clipPath id="solana__a"><path fill="#fff" d="M0 0h24v24H0z"/></clipPath></defs>',
  base: '<g clip-path="url(#base__a)"><path fill="#00F" d="M24 0H0v24h24z"/><path fill="#fff" d="M4 5.517c0-.52 0-.78.098-.98a.96.96 0 0 1 .44-.44C4.738 4 4.998 4 5.517 4h12.966c.52 0 .78 0 .98.098a.97.97 0 0 1 .439.44c.098.2.098.46.098.979v12.966c0 .52 0 .78-.098.98a.96.96 0 0 1-.44.439c-.2.098-.46.098-.979.098H5.517c-.52 0-.78 0-.98-.098a.96.96 0 0 1-.439-.44C4 19.263 4 19.002 4 18.484z"/></g><defs><clipPath id="base__a"><path fill="#fff" d="M0 0h24v24H0z"/></clipPath></defs>',
  bsc: '<g clip-path="url(#binance-smart-chain__a)"><path fill="#F0B90B" d="M24 0H0v24h24z"/><path fill="#fff" d="M7.635 6.449 12 4l4.364 2.449-1.6.907L12 5.809 9.24 7.356zm8.73 3.093-1.6-.906L12 10.182 9.24 8.636l-1.605.906v1.81l2.756 1.546v3.089l1.609.906 1.604-.906v-3.09l2.76-1.546zm0 4.903V12.63l-1.6.907v1.809zm1.141.64-2.76 1.542v1.813l4.365-2.453v-4.898l-1.605.902zm-1.604-7.09 1.6.907v1.81l1.609-.903V7.996l-1.605-.907L15.902 8zm-5.511 9.29v1.808L12 20l1.604-.907V17.29l-1.604.9-1.605-.907zM7.635 14.44l1.6.907v-1.81l-1.6-.906v1.813zm2.756-6.444L12 8.902l1.604-.906L12 7.089 10.395 8zm-3.898.906 1.605-.906-1.6-.907L4.888 8v1.813l1.605.903zm0 3.09-1.604-.903v4.898l4.364 2.453v-1.818L6.498 15.08v-3.093z"/></g><defs><clipPath id="binance-smart-chain__a"><path fill="#fff" d="M0 0h24v24H0z"/></clipPath></defs>',
  monad: '<g clip-path="url(#monad__a)"><path fill="#836EF9" d="M24 0H0v24h24z"/><path fill="#fff" d="M12 4c-2.31 0-8 5.69-8 8s5.69 8 8 8 8-5.69 8-8-5.69-8-8-8m-1.247 12.575c-.974-.266-3.593-4.847-3.328-5.822s4.848-3.593 5.822-3.328 3.593 4.847 3.328 5.822-4.847 3.593-5.822 3.328"/></g><defs><clipPath id="monad__a"><path fill="#fff" d="M0 0h24v24H0z"/></clipPath></defs>',
  robinhood: '<g clip-path="url(#robinhood__a)"><path fill="#CF0" d="M24 0H0v24h24z"/><path fill="#1C180D" d="M5.597 20h.37c.067 0 .134-.032.157-.086C8.918 13.13 11.958 9.77 13.866 7.76c.078-.086.045-.15-.068-.15h-3.41a.4.4 0 0 0-.315.15l-2.446 2.889c-.359.428-.448.824-.448 1.39v2.954c-.797 2.13-1.302 3.574-1.672 4.88-.023.083.011.128.09.128M17.905 4.43c-.527-.534-2.906-.555-4.006-.149a2.2 2.2 0 0 0-.55.31 28 28 0 0 0-2.322 2.12c-.079.074-.045.149.067.149h3.782c.347 0 .55.193.55.524v4.066c0 .107.09.14.156.043l2.278-2.835c.37-.46.483-.6.584-1.242.134-.941.056-2.386-.54-2.985m-4.88 10.787 1.559-2.45a.4.4 0 0 0 .045-.193V8.486c0-.107-.079-.15-.157-.064-2.345 2.493-4.174 5.115-5.868 8.272-.043.079.01.15.112.117l3.5-1.027c.395-.116.618-.268.808-.567"/></g><defs><clipPath id="robinhood__a"><path fill="#fff" d="M0 0h24v24H0z"/></clipPath></defs>',
  ethereum: '<g clip-path="url(#ethereum__a)"><path fill="#000" d="M24 0H0v24h24z"/><path fill="#8FFCF3" d="M12 4v5.912l5 2.237z"/><path fill="#CABCF8" d="m12 4-5 8.148 5-2.235z"/><path fill="#CBA7F5" d="M12 15.98V20l5-6.92z"/><path fill="#74A0F3" d="M12 20v-4.02l-5-2.9z"/><path fill="#CBA7F5" d="m12 15.049 5-2.9-5-2.236z"/><path fill="#74A0F3" d="m7 12.149 5 2.9V9.913z"/><path fill="#202699" fill-rule="evenodd" d="m12 15.048-5-2.9L12 4l5 8.148zm-4.67-3.136 4.588-7.475v5.435zm-.068.204 4.656-2.068v4.768zm4.816-2.068v4.768l4.653-2.7zm0-.176 4.588 2.04-4.588-7.475z" clip-rule="evenodd"/><path fill="#202699" fill-rule="evenodd" d="m12 15.917-5-2.84L12 20l5-6.924zm-4.44-2.341 4.36 2.48v3.56zm4.519 2.48v3.56l4.36-6.04z" clip-rule="evenodd"/></g><defs><clipPath id="ethereum__a"><path fill="#fff" d="M0 0h24v24H0z"/></clipPath></defs>',
  arc: '<g clip-path="url(#arc__a)"><path fill="url(#arc__b)" d="M24 0H0v24h24z"/><path fill="#fff" d="M4.5 19.999c.13-3.917.794-7.572 1.904-10.415C7.81 5.984 9.845 4 12.134 4s4.324 1.983 5.73 5.585c.731 1.872 1.27 4.098 1.588 6.52q.042.324.078.654.013.021.011.037s.187 1.17.227 3.204h-.02c-.279-.229-3.556-2.804-8.989-2.058.082-.92.195-1.814.34-2.671l.024-.13a21.8 21.8 0 0 1 5.426.508l-.015-.103c-.294-1.83-.728-3.506-1.287-4.939-.915-2.342-2.108-3.797-3.114-3.797S9.934 8.265 9.02 10.607a20 20 0 0 0-.604 1.808 27 27 0 0 0-.638 2.856A36 36 0 0 0 7.311 20H4.5z"/></g><defs><linearGradient id="arc__b" x1="12" x2="12" y1="0" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#182680"/><stop offset="1" stop-color="#842D56"/></linearGradient><clipPath id="arc__a"><path fill="#fff" d="M0 0h24v24H0z"/></clipPath></defs>',
};

/** Brand colour of each chain, for the selected chip's ring and wash. */
export const CHAIN_COLOR: Record<ChainId, string> = {
  solana: '#9945ff',
  base: '#0052ff',
  bsc: '#f0b90b',
  monad: '#836ef9',
  robinhood: '#9fcc00',
  ethereum: '#627eea',
  arc: '#6b4fe0',
};

export function ChainIcon(props: { chain: ChainId; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      className={props.className}
      // static markup from the vendored icon set above, never user input
      dangerouslySetInnerHTML={{ __html: PATHS[props.chain] }}
    />
  );
}
