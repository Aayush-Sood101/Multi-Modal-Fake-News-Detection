/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useRef } from 'react';
import { Network, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import * as d3 from 'd3';

interface NetworkNode {
  id: string;
  label: string;
  type: 'source' | 'author' | 'article' | 'reference';
  credibility: number;
}

interface NetworkLink {
  source: string;
  target: string;
  type: 'cites' | 'authored' | 'references';
  strength: number;
}

interface SourceNetworkProps {
  nodes?: NetworkNode[];
  links?: NetworkLink[];
}

const DEFAULT_NODES: NetworkNode[] = [
  { id: '1', label: 'Main Source', type: 'source', credibility: 65 },
  { id: '2', label: 'Author A', type: 'author', credibility: 80 },
  { id: '3', label: 'Article 1', type: 'article', credibility: 70 },
  { id: '4', label: 'Article 2', type: 'article', credibility: 55 },
  { id: '5', label: 'Reference 1', type: 'reference', credibility: 90 },
  { id: '6', label: 'Reference 2', type: 'reference', credibility: 45 },
];

const DEFAULT_LINKS: NetworkLink[] = [
  { source: '1', target: '2', type: 'authored', strength: 1 },
  { source: '2', target: '3', type: 'authored', strength: 1 },
  { source: '2', target: '4', type: 'authored', strength: 1 },
  { source: '3', target: '5', type: 'cites', strength: 0.8 },
  { source: '4', target: '6', type: 'references', strength: 0.6 },
];

export function SourceNetwork({ 
  nodes = DEFAULT_NODES, 
  links = DEFAULT_LINKS 
}: SourceNetworkProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 400;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Create arrow markers for links
    svg.append('defs').selectAll('marker')
      .data(['cites', 'authored', 'references'])
      .join('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', '#94a3b8')
      .attr('d', 'M0,-5L10,0L0,5');

    // Color scale based on credibility
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 50, 100])
      .range(['#ef4444', '#eab308', '#22c55e']);

    // Node size based on type
    const nodeSize = (type: string) => {
      switch (type) {
        case 'source': return 12;
        case 'author': return 10;
        case 'article': return 8;
        case 'reference': return 6;
        default: return 8;
      }
    };

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => d.strength * 2)
      .attr('marker-end', (d: any) => `url(#arrow-${d.type})`);

    // Create nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    node.append('circle')
      .attr('r', (d: any) => nodeSize(d.type))
      .attr('fill', (d: any) => colorScale(d.credibility))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    node.append('text')
      .text((d: any) => d.label)
      .attr('x', 15)
      .attr('y', 4)
      .attr('font-size', '12px')
      .attr('fill', 'currentColor');

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Source Network Graph
          </span>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded" title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button className="p-2 hover:bg-muted rounded" title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </button>
            <button className="p-2 hover:bg-muted rounded" title="Fullscreen">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </CardTitle>
        <CardDescription>
          Interactive force-directed graph showing source relationships
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div ref={containerRef} className="w-full border rounded-lg bg-muted/10">
            <svg ref={svgRef} className="w-full" />
          </div>

          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
              <span>High Credibility (70+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }} />
              <span>Medium Credibility (40-70)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
              <span>Low Credibility (0-40)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <Badge variant="outline">
              <span className="w-2 h-2 rounded-full bg-primary inline-block mr-1" />
              Source
            </Badge>
            <Badge variant="outline">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block mr-1" />
              Author
            </Badge>
            <Badge variant="outline">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block mr-1" />
              Article
            </Badge>
            <Badge variant="outline">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-1" />
              Reference
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Drag nodes to explore relationships • Click to view details
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
