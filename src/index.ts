import { Calculator } from './Calculator';
import {
  ProvenanceGraph,
  ProvenanceTracker,
  ProvenanceGraphTraverser,
  ActionFunctionRegistry,
  ProvenanceSlide,
  ProvenanceSlidedeck,
  ProvenanceSlidedeckPlayer,
} from '@visualstorytelling/provenance-core';

import { ProvenanceTreeVisualization } from '@visualstorytelling/provenance-tree-visualization';

import { SlideDeckVisualization } from '@visualstorytelling/slide-deck-visualization';

import 'normalize.css';
import './style.scss';
import '@visualstorytelling/slide-deck-visualization/dist/bundle.css';

const visDiv: HTMLDivElement = document.getElementById('vis') as HTMLDivElement;
const stateDiv: HTMLDivElement = document.getElementById(
  'state',
) as HTMLDivElement;
const increaseBtn: HTMLButtonElement = document.getElementById(
  'increase',
) as HTMLButtonElement;
const playBtn: HTMLButtonElement = document.getElementById(
  'play',
) as HTMLButtonElement;

const graph = new ProvenanceGraph({ name: 'calculator', version: '1.0.0' });
const registry = new ActionFunctionRegistry();
const tracker = new ProvenanceTracker(registry, graph);
const traverser = new ProvenanceGraphTraverser(registry, graph);

let player: ProvenanceSlidedeckPlayer<ProvenanceSlide>;

const calculator = new Calculator(graph, registry, tracker, traverser);

increaseBtn.addEventListener('click', async () => {
  const node = await tracker.applyAction({
    do: 'add',
    doArguments: [5],
    undo: 'subtract',
    undoArguments: [5],
    metadata: {
      createdBy: 'me',
      createdOn: 'now',
      tags: [],
      userIntent: 'add',
    },
  });
  node.label = 'add 5';
});

graph.on('currentChanged', (event) => {
  stateDiv.innerHTML = calculator.currentState().toString();
});

let provenanceTreeVisualization: ProvenanceTreeVisualization;

calculator.setupBasicGraph().then(() => {
  provenanceTreeVisualization = new ProvenanceTreeVisualization(
    traverser,
    visDiv,
  );

  const slideDeck = new ProvenanceSlidedeck(
    { name: 'calculator', version: '1.0.0' },
    traverser,
  );
  const slide1 = new ProvenanceSlide('Root', 5000, 1000, [], graph.root);
  const slide2 = new ProvenanceSlide(
    'Add 13',
    5000,
    1000,
    [],
    graph.root.children[0],
  );
  const slide3 = new ProvenanceSlide(
    'Sub 20',
    5000,
    1000,
    [],
    graph.root.children[0].children[1].children[0],
  );
  const slide4 = new ProvenanceSlide(
    'Add 5',
    5000,
    1000,
    [],
    graph.root.children[0].children[1].children[0].children[0],
  );
  const slide5 = new ProvenanceSlide(
    'Mul 2',
    5000,
    1000,
    [],
    graph.root.children[0].children[1].children[0].children[0].children[0],
  );

  slideDeck.addSlide(slide1);
  slideDeck.addSlide(slide2);
  slideDeck.addSlide(slide3);
  slideDeck.addSlide(slide4);
  slideDeck.addSlide(slide5);

  const provenanceSlidedeckVis = new SlideDeckVisualization(
    slideDeck,
    document.getElementById('slidedeck_root') as HTMLDivElement,
  );

  player = new ProvenanceSlidedeckPlayer(
    slideDeck.slides as ProvenanceSlide[],
    (slide) => (slideDeck.selectedSlide = slide),
  );

  playBtn.addEventListener('click', () => {
    player.setSlideIndex(slideDeck.slides.indexOf(slideDeck.selectedSlide));
    player.play();
  });
});
