import 'normalize.css';
import './style.scss';
import { Calculator } from './Calculator';
import {
  ProvenanceGraph,
  ProvenanceTracker,
  ProvenanceGraphTraverser,
  ActionFunctionRegistry,
} from '@visualstorytelling/provenance-core';

import { ProvenanceTreeVisualization } from '@visualstorytelling/provenance-tree-visualization';
import { ProvenanceSlidedeck } from '../../provenance-slide-deck/src/provenance-slide-deck';
import { ProvenanceSlidedeckVisualization } from '../../provenance-slide-deck/src/provenance-slide-deck-visualization';
import { ProvenanceSlide } from '../../provenance-slide-deck/src/provenance-slide';

const visDiv: HTMLDivElement = document.getElementById('vis') as HTMLDivElement;
const stateDiv: HTMLDivElement = document.getElementById('state') as HTMLDivElement;
const increaseBtn: HTMLButtonElement = document.getElementById('increase') as HTMLButtonElement;

const graph = new ProvenanceGraph({ name: 'calculator', version: '1.0.0' });
const registry = new ActionFunctionRegistry();
const tracker = new ProvenanceTracker(registry, graph);
const traverser = new ProvenanceGraphTraverser(registry, graph);

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

  const slideDeck = new ProvenanceSlidedeck(traverser);
  const slide1 = new ProvenanceSlide('slide1', 1, 1, [], graph.root);
  const slide2 = new ProvenanceSlide('slide2', 1, 1, [], graph.root.children[0]);
  slideDeck.addSlide(slide1);
  slideDeck.addSlide(slide2);
  const provenanceSlidedeckVis =
    new ProvenanceSlidedeckVisualization(slideDeck, document.getElementById('slides') as HTMLDivElement);
});
