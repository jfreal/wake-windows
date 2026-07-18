// @doc:interactive-troubleshooter

// Deterministic decision-tree engine for the sleep troubleshooter. Trees are
// plain typed data (see data/troubleshooterTrees.ts); this module only walks
// and validates them — no LLM, no network, no account (spec B05).

export type NodeId = string

export interface TroubleshooterOption {
     label: string
     next: NodeId
}

export interface QuestionNode {
     id: NodeId
     kind: 'question'
     prompt: string
     help?: string
     options: TroubleshooterOption[]
}

// 'advice'      → a concrete, range-based suggestion (cited, Tier 3)
// 'reassurance' → "this is normal, nothing to fix" (cited, Tier 3)
// 'medical'     → red-flag exit: "check with your pediatrician", no diagnosis
export type LeafKind = 'advice' | 'reassurance' | 'medical'

export interface LeafNode {
     id: NodeId
     kind: 'leaf'
     leafKind: LeafKind
     title: string
     body: string[]
     suggestion?: string
     patienceNote?: string
     tier?: number
     sourceIds?: string[]
}

export type TroubleshooterNode = QuestionNode | LeafNode

export interface TroubleshooterTree {
     id: string
     title: string
     tagline: string
     rootId: NodeId
     nodes: TroubleshooterNode[]
}

// --- Session (immutable: every step returns a new session object) ---

export interface TroubleshooterSession {
     tree: TroubleshooterTree
     path: NodeId[]
     choices: number[]
}

export interface AnsweredStep {
     prompt: string
     answer: string
}

export function nodeById(tree: TroubleshooterTree, id: NodeId): TroubleshooterNode {
     const node = tree.nodes.find((n) => n.id === id)
     if (!node) throw new Error(`Troubleshooter tree "${tree.id}" has no node "${id}"`)
     return node
}

export function createSession(tree: TroubleshooterTree): TroubleshooterSession {
     return { tree, path: [tree.rootId], choices: [] }
}

export function currentNode(session: TroubleshooterSession): TroubleshooterNode {
     return nodeById(session.tree, session.path[session.path.length - 1])
}

export function isComplete(session: TroubleshooterSession): boolean {
     return currentNode(session).kind === 'leaf'
}

export function chooseOption(session: TroubleshooterSession, optionIndex: number): TroubleshooterSession {
     const node = currentNode(session)
     if (node.kind !== 'question') return session
     const option = node.options[optionIndex]
     if (!option) return session
     return {
          tree: session.tree,
          path: [...session.path, option.next],
          choices: [...session.choices, optionIndex],
     }
}

export function goBack(session: TroubleshooterSession): TroubleshooterSession {
     if (session.path.length <= 1) return session
     return {
          tree: session.tree,
          path: session.path.slice(0, -1),
          choices: session.choices.slice(0, -1),
     }
}

export function answeredSteps(session: TroubleshooterSession): AnsweredStep[] {
     return session.choices.map((choice, i) => {
          const node = nodeById(session.tree, session.path[i]) as QuestionNode
          return { prompt: node.prompt, answer: node.options[choice].label }
     })
}

// --- Validation (structural; citation resolution is asserted in tests) ---

export function validateTree(tree: TroubleshooterTree): string[] {
     const errors: string[] = []
     const byId = new Map<NodeId, TroubleshooterNode>()

     for (const node of tree.nodes) {
          if (byId.has(node.id)) errors.push(`duplicate node id "${node.id}"`)
          byId.set(node.id, node)
     }

     if (!byId.has(tree.rootId)) {
          errors.push(`rootId "${tree.rootId}" does not exist`)
          return errors
     }

     for (const node of tree.nodes) {
          if (node.kind === 'question') {
               if (node.options.length < 2) errors.push(`question "${node.id}" has fewer than 2 options`)
               for (const opt of node.options) {
                    if (!byId.has(opt.next)) errors.push(`option "${opt.label}" on "${node.id}" points to missing node "${opt.next}"`)
               }
          } else {
               if (node.leafKind !== 'medical') {
                    if (node.tier === undefined) errors.push(`leaf "${node.id}" has no evidence tier`)
                    if (!node.sourceIds?.length) errors.push(`leaf "${node.id}" has no citations`)
                    if (!node.patienceNote) errors.push(`leaf "${node.id}" has no patience note`)
               }
               if (node.leafKind === 'advice' && !node.suggestion) {
                    errors.push(`advice leaf "${node.id}" has no concrete suggestion`)
               }
          }
     }

     // Reachability + cycle check (DFS from root; a decision tree must be acyclic).
     const visiting = new Set<NodeId>()
     const done = new Set<NodeId>()
     const visit = (id: NodeId): void => {
          if (done.has(id)) return
          if (visiting.has(id)) {
               errors.push(`cycle detected through node "${id}"`)
               return
          }
          visiting.add(id)
          const node = byId.get(id)
          if (node?.kind === 'question') {
               for (const opt of node.options) {
                    if (byId.has(opt.next)) visit(opt.next)
               }
          }
          visiting.delete(id)
          done.add(id)
     }
     visit(tree.rootId)

     for (const node of tree.nodes) {
          if (!done.has(node.id)) errors.push(`node "${node.id}" is unreachable from the root`)
     }

     return errors
}
