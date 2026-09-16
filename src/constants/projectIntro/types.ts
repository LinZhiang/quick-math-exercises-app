export type ProjectIntroLeaf = {
  title: string
  text: string
}

export type ProjectIntroSection = {
  id: string
  title: string
  summary: string
  leaves: ProjectIntroLeaf[]
}
