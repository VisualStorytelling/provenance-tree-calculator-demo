import { Calculator } from './Calculator';
import {
  ProvenanceGraph,
  ProvenanceTracker,
  ProvenanceGraphTraverser,
  ActionFunctionRegistry,
} from '@visualstorytelling/provenance-core';

import { ProvenanceTreeVisualization } from '@visualstorytelling/provenance-tree-visualization';

import {
  ProvenanceSlide,
  ProvenanceSlidedeck,
  ProvenanceSlidedeckVisualization,
  ProvenanceSlidePlayer,
} from '@visualstorytelling/provenance-slide-deck';

import 'normalize.css';
import './style.scss';
import '@visualstorytelling/provenance-slide-deck/dist/bundle.css';

const visDiv: HTMLDivElement = document.getElementById('vis') as HTMLDivElement;
const stateDiv: HTMLDivElement = document.getElementById('state') as HTMLDivElement;
const increaseBtn: HTMLButtonElement = document.getElementById('increase') as HTMLButtonElement;
const playBtn: HTMLButtonElement = document.getElementById('play') as HTMLButtonElement;

const graph = new ProvenanceGraph({ name: 'calculator', version: '1.0.0' });
const registry = new ActionFunctionRegistry();
const tracker = new ProvenanceTracker(registry, graph);
const traverser = new ProvenanceGraphTraverser(registry, graph);

let player: ProvenanceSlidePlayer<ProvenanceSlide>;

const calculator = new Calculator(
  graph,
  registry,
  tracker,
  traverser,
);

increaseBtn.addEventListener('click', () => {
  tracker.applyAction({
    do: 'add',
    doArguments: [5],
    undo: 'subtract',
    undoArguments: [5],
    metadata: {
      createdBy: 'me',
      createdOn: 'now',
      tags: [],
      userIntent: 'Because I want to',
    },
  });
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

  const slideDeck = new ProvenanceSlidedeck({ name: 'calculator', version: '1.0.0' }, traverser);
  const slide1 = new ProvenanceSlide('Root', 5000, 1000, [], graph.root);
  const slide2 = new ProvenanceSlide('Add 13', 5000, 1000, [], graph.root.children[0]);
  const slide3 = new ProvenanceSlide('Sub 20', 5000, 1000, [], graph.root.children[0]
    .children[1].children[0]);
  const slide4 = new ProvenanceSlide('Add 5', 5000, 1000, [], graph.root.children[0]
    .children[1].children[0].children[0]);
  const slide5 = new ProvenanceSlide('Mul 2', 5000, 1000, [], graph.root.children[0]
    .children[1].children[0].children[0].children[0]);

  slideDeck.addSlide(slide1);
  slideDeck.addSlide(slide2);
  slideDeck.addSlide(slide3);
  slideDeck.addSlide(slide4);
  slideDeck.addSlide(slide5);

  const provenanceSlidedeckVis =
    new ProvenanceSlidedeckVisualization(slideDeck, document.getElementById('slidedeck_root') as HTMLDivElement);

  player = new ProvenanceSlidePlayer(
    slideDeck.slides as ProvenanceSlide[],
    (slide) => slideDeck.selectedSlide = slide,
  );

  playBtn.addEventListener('click', () => {
    player.setSlideIndex(slideDeck.slides.indexOf(slideDeck.selectedSlide));
    player.play();
  });

});
