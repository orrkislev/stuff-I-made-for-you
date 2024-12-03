//:HTML
<h2 class="text-2xl font-semibold mb-4 text-indigo-600">8. Creating a Multi-layered Glow</h2>
<p class="mb-4">Time to amp up the glow! We're adding multiple layers of glow to each ellipse. It's like looking at stars twinkling in the night sky. Each layer adds depth and energy to our shapes.</p>
<div class="bg-white px-4 rounded-lg shadow-md text-xs">
    <h3 class="font-semibold text-lg mb-2 text-indigo-500">Code focus:</h3>
    <ul class="list-disc pl-5 space-y-2">
        <li><code class="bg-gray-200 px-1 rounded">const blurs = [30,15,10,5,2]</code>: An array of blur values for different glow layers.</li>
        <li>The <code class="bg-gray-200 px-1 rounded">for</code> loop: This draws the ellipse multiple times with different blur values.</li>
    </ul>
</div>
//:JS
background(0)
stroke(255, 255, 0)
noFill()

const dirVector = V(mouseX - width / 2, mouseY - height / 2)
const ang = dirVector.heading()
rotate(ang)

ratio = map(dirVector.mag(), 0, width / 2, 1, .2)
size = 100

drawingContext.shadowColor = 'white'

const blurs = [30,15,10,5,2]
for (const blur of blurs) {
    drawingContext.shadowBlur = blur
    ellipse(0, 0, size * ratio, size)
}

zOffset = 50
translate(zOffset * (1 - ratio), 0)
size = 80
for (const blur of blurs) {
    drawingContext.shadowBlur = blur
    ellipse(0, 0, size * ratio, size)
}
