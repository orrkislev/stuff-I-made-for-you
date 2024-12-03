//:HTML
<h2 class="text-2xl font-semibold mb-4 text-indigo-600">3. Adjusting the Ellipse Ratio</h2>
<p class="mb-4">Time to squish and stretch! We're introducing a 'ratio' to adjust the ellipse's width. As you move your mouse, watch how the ellipse changes shape. It's like it's breathing!</p>
<div class="bg-white px-4 rounded-lg shadow-md text-xs">
    <h3 class="font-semibold text-lg mb-2 text-indigo-500">Code focus:</h3>
    <ul class="list-disc pl-5 space-y-2">
        <li><code class="bg-gray-200 px-1 rounded">const ratio = 0.5</code>: This determines how 'squished' the ellipse is.</li>
        <li><code class="bg-gray-200 px-1 rounded">ellipse(0, 0, size * ratio, size)</code>: The width is now <code class="bg-gray-200 px-1 rounded">size * ratio</code>.</li>
    </ul>
</div>
//:JS
const dirVector = V(mouseX - width / 2, mouseY - height / 2)
const ang = dirVector.heading()
rotate(ang)

ratio = sin(frameCount) * 0.5
const size = 100

ellipse(0, 0, size * ratio, size)